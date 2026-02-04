import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import {
  ChangeEvent,
  ChangeEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import { Message, UserChatsData } from "../../types";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

interface ChatMessages {
  messages: Message[];
}

interface ChatProps {
  setIsDetailOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDetailOpen: boolean;
}

function Chat({ setIsDetailOpen, isDetailOpen }: ChatProps) {
  const [chat, setChat] = useState<ChatMessages | undefined>(undefined);
  const [text, setText] = useState("");
  const [img, setImg] = useState<{ file: File | null; url: string }>({
    file: null,
    url: "",
  });
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [otherUserStatus, setOtherUserStatus] = useState<string | undefined>();
  const [menuOpenMessageId, setMenuOpenMessageId] = useState<string | null>(null);

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
  const { currentUser } = useUserStore();

  const menuBtnRef = useRef<HTMLImageElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Listen to chat messages
  useEffect(() => {
    if (!chatId) return;
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data() as ChatMessages | undefined);
    });
    return () => unSub();
  }, [chatId]);

  // Listen to other user's status
  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = onSnapshot(doc(db, "users", user.id), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setOtherUserStatus(docSnapshot.data().status);
      }
    });
    return () => unsubscribe();
  }, [user?.id]);

  // Click outside to close context menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(event.target as Node)
      ) {
        setMenuOpenMessageId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateUserChatsLastMessage = async (lastMessage: string) => {
    const userIds = [currentUser?.id, user!.id];

    userIds.forEach(async (id) => {
      if (id) {
        const userChatsRef = doc(db, "userChats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data() as UserChatsData;
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = lastMessage;
          userChatsData.chats[chatIndex].isSeen = id === currentUser!.id;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, { chats: userChatsData.chats });
        }
      }
    });
  };

  const scheduleEditableTimeout = (chatId: string, messageIso: string) => {
    const timeoutId = setTimeout(async () => {
      try {
        const chatRef = doc(db, "chats", chatId);
        const chatSnapshot = await getDoc(chatRef);
        if (chatSnapshot.exists()) {
          const chatData = chatSnapshot.data() as ChatMessages;
          const updatedMessages = chatData.messages.map((message) =>
            message.createdAt.nanoseconds.toString() === messageIso
              ? { ...message, editable: false }
              : message
          );
          await updateDoc(chatRef, { messages: updatedMessages });
        }
      } catch {
        // timeout failed silently
      }
    }, 15 * 60 * 1000);
    localStorage.setItem(`chatTimeoutId_${messageIso}`, timeoutId.toString());
  };

  const handleMessageSend = async (): Promise<void> => {
    if (text === "") return;

    if (editingMessage) {
      await handleEditMessage(
        editingMessage.createdAt.nanoseconds.toString(),
        text
      );
      setEditingMessage(null);
    } else {
      let imgUrl = null;

      try {
        if (img.file) {
          imgUrl = await upload(img.file);
        }

        if (chatId) {
          const newMessage = {
            senderId: currentUser?.id,
            text,
            createdAt: new Date(),
            editable: true,
            ...(imgUrl ? { img: imgUrl } : {}),
          };

          await updateDoc(doc(db, "chats", chatId), {
            messages: arrayUnion(newMessage),
          });

          scheduleEditableTimeout(chatId, newMessage.createdAt.toISOString());
        }

        await updateUserChatsLastMessage(text);
      } catch {
        // send failed silently
      }

      setImg({ file: null, url: "" });
    }
    setText("");
  };

  const handleImageUpload = async (file: File) => {
    try {
      const imgUrl = await upload(file);

      if (chatId && imgUrl) {
        const newMessage = {
          senderId: currentUser?.id,
          text: "",
          img: imgUrl,
          createdAt: new Date(),
          editable: true,
        };

        await updateDoc(doc(db, "chats", chatId), {
          messages: arrayUnion(newMessage),
        });

        setImg({ file: null, url: "" });
        scheduleEditableTimeout(chatId, newMessage.createdAt.toISOString());
      }

      await updateUserChatsLastMessage("Image");
    } catch {
      // image upload failed silently
    }
  };

  const handleImg: ChangeEventHandler = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setImg({
      file: e.target.files[0],
      url: URL.createObjectURL(e.target.files[0]),
    });
    handleImageUpload(e.target.files[0]);
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!chatId) return;
    try {
      const chatRef = doc(db, "chats", chatId);
      const chatSnapshot = await getDoc(chatRef);
      if (chatSnapshot.exists()) {
        const chatData = chatSnapshot.data() as ChatMessages;
        const updatedMessages = chatData.messages.map((message) =>
          message.createdAt.nanoseconds.toString() === messageId
            ? { ...message, text: newText }
            : message
        );
        await updateDoc(chatRef, { messages: updatedMessages });
      }
    } catch {
      // edit failed silently
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!chatId) return;
    try {
      const chatRef = doc(db, "chats", chatId);
      const chatSnapshot = await getDoc(chatRef);
      if (chatSnapshot.exists()) {
        const chatData = chatSnapshot.data() as ChatMessages;
        const updatedMessages = chatData.messages.filter(
          (message) => message.createdAt.nanoseconds.toString() !== messageId
        );
        await updateDoc(chatRef, { messages: updatedMessages });
      }
    } catch {
      // delete failed silently
    }
  };

  return (
    <div className="chatFlex border-r border-border h-full w-[50%] flex flex-col">
      <ChatHeader
        user={user}
        otherUserStatus={otherUserStatus}
        onToggleDetail={() => setIsDetailOpen((prev) => !prev)}
      />
      <MessageList
        messages={chat?.messages || []}
        currentUserId={currentUser?.id}
        imgPreviewUrl={img.url}
        menuOpenMessageId={menuOpenMessageId}
        menuBtnRef={menuBtnRef}
        menuRef={menuRef}
        onToggleMenu={(id) =>
          setMenuOpenMessageId((prev) => (prev === id ? null : id))
        }
        onEdit={setEditingMessage}
        onDelete={handleDeleteMessage}
        onCloseMenu={() => setMenuOpenMessageId(null)}
      />
      <ChatInput
        text={text}
        setText={setText}
        editingMessage={editingMessage}
        setEditingMessage={setEditingMessage}
        isBlocked={isCurrentUserBlocked || isReceiverBlocked}
        isDetailOpen={isDetailOpen}
        onSend={handleMessageSend}
        onImageSelect={handleImg}
      />
    </div>
  );
}

export default Chat;
