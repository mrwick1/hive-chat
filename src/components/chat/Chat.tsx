import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import "react-perfect-scrollbar/dist/css/styles.css";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  Timestamp,
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

interface Message {
  senderId: string | undefined;
  text: string;
  img?: string;
  createdAt: Timestamp;
  editable: boolean;
}

interface Chat {
  messages: Message[];
}

interface ChatData {
  chatId: string;
  lastMessage: string;
  isSeen: boolean;
  updatedAt: number;
}

interface UserChatsData {
  chats: ChatData[];
}

interface ChatProps {
  setIsDetailOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDetailOpen: boolean;
}

// const updateUserStatus = async (uid: string, status: string) => {
//   const userRef = doc(db, "users", uid);
//   await updateDoc(userRef, {
//     status,
//     lastSeen: serverTimestamp(),
//   });
// };

function Chat({ setIsDetailOpen, isDetailOpen }: ChatProps) {
  const [openEmoji, setEmojiOpen] = useState<boolean>(false);
  const [chat, setChat] = useState<Chat | undefined>(undefined);
  const [text, setText] = useState("");
  const [img, setImg] = useState<{
    file: File | null;
    url: string;
  }>({
    file: null,
    url: "",
  });
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  // const [input, setInput] = useState<string>("");

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();

  const [otherUserStatus, setOtherUserStatus] = useState(user?.status);

  const [menuOpenMessageId, setMenuOpenMessageId] = useState<string | null>(
    null
  );

  const toggleMenu = (messageId: string) => {
    setMenuOpenMessageId((prev) => (prev === messageId ? null : messageId));
  };

  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void =>
    endRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const handleImageLoad = () => scrollToBottom();

  const handleEmoji = (e: EmojiClickData) => {
    // console.log(e);

    setText((prev) => prev + e.emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    // setEmojiOpen(false);
  };

  useEffect(() => {
    if (!chatId) return;
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      const chatData = res.data() as Chat | undefined;
      setChat(chatData);
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleMessageSend = async (): Promise<void> => {
    if (text === "") return;

    if (editingMessage) {
      // Update the existing message
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

          const timeoutId = setTimeout(async () => {
            try {
              const chatRef = doc(db, "chats", chatId);
              const chatSnapshot = await getDoc(chatRef);
              if (chatSnapshot.exists()) {
                const chatData = chatSnapshot.data() as Chat;
                const updatedMessages = chatData.messages.map((message) =>
                  message.createdAt.nanoseconds.toString() ===
                  newMessage.createdAt.toISOString()
                    ? { ...message, editable: false }
                    : message
                );

                await updateDoc(chatRef, { messages: updatedMessages });
              } else {
                console.error("Chat not found");
              }
            } catch (error) {
              console.error("Error updating chat", error);
            }
          }, 15 * 60 * 1000);
          localStorage.setItem(
            `chatTimeoutId_${newMessage.createdAt.toISOString()}`,
            timeoutId.toString()
          );
        }

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

              userChatsData.chats[chatIndex].lastMessage = text;
              userChatsData.chats[chatIndex].isSeen =
                id === currentUser!.id ? true : false;
              userChatsData.chats[chatIndex].updatedAt = Date.now();

              await updateDoc(userChatsRef, { chats: userChatsData.chats });
            }
          }
        });
      } catch (error) {
        if (error instanceof Error) {
          console.log(error);
        }
      }

      setImg({
        file: null,
        url: "",
      });
    }
    setText("");
  };

  const handleImageUpload = async (file: File) => {
    let imgUrl = null;

    try {
      imgUrl = await upload(file);

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

        setImg({
          file: null,
          url: "",
        });

        const timeoutId = setTimeout(async () => {
          try {
            const chatRef = doc(db, "chats", chatId);
            const chatSnapshot = await getDoc(chatRef);
            if (chatSnapshot.exists()) {
              const chatData = chatSnapshot.data() as Chat;
              const updatedMessages = chatData.messages.map((message) =>
                message.createdAt.nanoseconds.toString() ===
                newMessage.createdAt.toISOString()
                  ? { ...message, editable: false }
                  : message
              );

              await updateDoc(chatRef, { messages: updatedMessages });
            }
          } catch (error) {
            console.error("Error updating chat", error);
          }
        }, 15 * 60 * 1000);
        localStorage.setItem(
          `chatTimeoutId_${newMessage.createdAt.toISOString()}`,
          timeoutId.toString()
        );
      }
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

            userChatsData.chats[chatIndex].lastMessage = "Image";
            userChatsData.chats[chatIndex].isSeen =
              id === currentUser!.id ? true : false;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, { chats: userChatsData.chats });
          }
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
      }
    }
  };

  const handleImg: ChangeEventHandler = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!chatId) return;

    try {
      const chatRef = doc(db, "chats", chatId);
      const chatSnapshot = await getDoc(chatRef);
      if (chatSnapshot.exists()) {
        const chatData = chatSnapshot.data() as Chat;
        const updatedMessages = chatData.messages.map((message) =>
          message.createdAt.nanoseconds.toString() === messageId
            ? { ...message, text: newText }
            : message
        );

        await updateDoc(chatRef, { messages: updatedMessages });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
      }
    }
  };

  // const handleEditSubmit = async () => {
  //   if (editingMessage) {
  //     await handleEditMessage(
  //       editingMessage.createdAt.nanoseconds.toString(),
  //       text
  //     );
  //     setEditingMessage(null);
  //     setText("");
  //   }
  // };

  const handleDeleteMessage = async (messageId: string) => {
    if (!chatId) return;

    try {
      const chatRef = doc(db, "chats", chatId);
      const chatSnapshot = await getDoc(chatRef);
      if (chatSnapshot.exists()) {
        const chatData = chatSnapshot.data() as Chat;
        const updatedMessages = chatData.messages.filter(
          (message) => message.createdAt.nanoseconds.toString() !== messageId
        );

        await updateDoc(chatRef, { messages: updatedMessages });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && text.trim()) {
      e.preventDefault();
      handleMessageSend();
      setEmojiOpen(false);
    }
  };

  const infoDetailHandler = (): void => {
    setIsDetailOpen((prev: boolean) => !prev);
  };

  // console.log(chat);

  const formatDate = (timestamp: Timestamp) => {
    const messageDate = timestamp.toDate();
    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    const isToday =
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear();

    const isYesterday =
      messageDate.getDate() === yesterday.getDate() &&
      messageDate.getMonth() === yesterday.getMonth() &&
      messageDate.getFullYear() === yesterday.getFullYear();

    if (isToday) return "Today";
    else if (isYesterday) return "Yesterday";
    else if (messageDate.getFullYear === today.getFullYear)
      return messageDate.toLocaleDateString("en-US", {
        month: "long", // "January"
        day: "numeric", // "10"
      });
    else
      return messageDate.toLocaleDateString("en-US", {
        month: "long", // "January"
        day: "numeric", // "10"
        year: "numeric", // "2024"
      });
  };

  const isDifferentDay = (
    currentMessage: Message,
    previousMessage?: Message
  ) => {
    if (!previousMessage) return true;
    const currentDate = currentMessage.createdAt.toDate();
    const previousDate = previousMessage.createdAt.toDate();
    return (
      currentDate.getFullYear() !== previousDate.getFullYear() ||
      currentDate.getMonth() !== previousDate.getMonth() ||
      currentDate.getDate() !== previousDate.getDate()
    );
  };

  useEffect(() => {
    const userRef = doc(db, "users", user?.id as string);
    const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setOtherUserStatus(docSnapshot.data().status);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user, user?.status]);

  const more1btnRef = useRef<HTMLImageElement | null>(null);
  const more1Ref = useRef<HTMLDivElement | null>(null);
  const emojiRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        more1Ref.current &&
        !more1Ref.current.contains(event.target as Node) &&
        more1btnRef.current &&
        !more1btnRef.current.contains(event.target as Node)
      ) {
        setMenuOpenMessageId(null);
      } else if (
        emojiRef.current &&
        !emojiRef.current.contains(event.target as Node)
      ) {
        setEmojiOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="chatFlex border-r-2 border-bgBlacker h-full w-[50%] flex flex-col">
      <div className="top px-4 pt-5 pb-3 flex items-center justify-between border-b-2 border-none">
        <div className="user flex items-center gap-5">
          <img
            className="w-[45px] h-[45px] rounded-full object-cover"
            src={user?.avatar || "./avatar.png"}
            alt=""
          />
          <div className="texts flex flex-col gap-0.5">
            <span className="text-lg font-bold">
              {user?.username}{" "}
              {
                <span className="text-xs font-light text-gray-200 ml-2">
                  {otherUserStatus}
                </span>
                // otherUserStatus === "active" ? <span className="inline-block mr-1 w-2 h-2 rounded-full border-green-500 bg-green-500 cursor-pointer"></span> : otherUserStatus === "Offline" ? <span className="inline-block mr-1 w-2 h-2 rounded-full border-gray-500 bg-gray-500"></span> : <span className="inline-block w-2 h-2 rounded-full mr-1  border-yellow-400 bg-yellow-400"></span>
              }
            </span>
            <p className="text-xs font-normal text-gray-400">{user?.about} </p>
          </div>
        </div>
        <div className="icons flex gap-5">
          <img className="w-5 h-5 hidden" src="./phone.png" alt="" />
          <img className="w-5 h-5 hidden" src="./video.png" alt="" />
          <img
            className="w-5 h-5 cursor-pointer"
            src="./info.png"
            onClick={infoDetailHandler}
            alt=""
          />
        </div>
      </div>
      <div className="center p-5 flex-1 overflow-y-auto flex flex-col gap-2">
        {chat?.messages.map((message, index) => {
          const previousMessage = chat?.messages[index - 1];
          const showDateSeparator = isDifferentDay(message, previousMessage);

          return (
            <div key={message?.createdAt.nanoseconds}>
              <div className="flex justify-center">
                {showDateSeparator && (
                  <p className="rounded-xl addUserBDF my-5 text-sm px-3 py-1">
                    {formatDate(message.createdAt)}
                  </p>
                )}
              </div>

              <div
                className={`${
                  message.senderId === currentUser?.id
                    ? "message own"
                    : "message"
                } flex gap-5`}
                key={message?.createdAt.nanoseconds}
              >
                <div className="texts flex-1 flex flex-col gap-1.5">
                  {message.img && (
                    <img
                      className={`max-w-[380px] max-h-[244px] ${
                        message.senderId === currentUser?.id
                          ? "message own"
                          : "message"
                      } flex gap-5 rounded-lg object-cover`}
                      onLoad={handleImageLoad}
                      src={message.img}
                    />
                  )}
                  <p className="rounded-lg sm:max-w-[60%] max-w-fit max-w-fit-plus-30 min-w-28 min-h-6 relative">
                    <span className="message-text">{message.text}</span>
                    <span className="flex items-center">
                      <span
                        className={`mx-2 absolute bottom-[2px] ${
                          message.senderId === currentUser?.id
                            ? "right-2"
                            : "right-0"
                        } text-xxs text-slate-200`}
                      >
                        {message.createdAt &&
                          message.createdAt.toDate().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </span>
                      {/* {message.editable && (
                      <button onClick={() => setEditingMessage(message)}>
                        Edit
                      </button>
                    )}
                    {message.senderId === currentUser?.id && (
                      <button
                        onClick={() => {
                          const confirmed = window.confirm(
                            "Are you sure you want to delete this message?"
                          );
                          if (confirmed)
                            handleDeleteMessage(
                              message.createdAt.nanoseconds.toString()
                            );
                        }}
                      >
                        Delete
                      </button>
                    )} */}
                      {message.senderId === currentUser?.id && (
                        <img
                          className="w-[10px] h-[10px] absolute bottom-[2.5px] right-0 cursor-pointer inline-block ml-1 mb-1"
                          src="./more1.png"
                          alt="More options"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(
                              message.createdAt.nanoseconds.toString()
                            );
                          }}
                          ref={more1btnRef}
                        />
                      )}
                    </span>
                    {menuOpenMessageId ===
                      message.createdAt.nanoseconds.toString() && (
                      <div
                        className="absolute right-0 mt-3 w-32 addUserBDF rounded-md shadow-lg z-10 menu-container"
                        ref={more1Ref}
                      >
                        <ul className="py-1">
                          {(message.editable ?? false) &&
                            message.senderId === currentUser?.id &&
                            (
                              <li>
                                <button
                                  className="block px-2 py-2 text-sm text-white hover:backdrop:filter hover:bg-addUserBDFH w-full text-left"
                                  onClick={() => {
                                    setEditingMessage(message);
                                    setMenuOpenMessageId(null);
                                  }}
                                >
                                  Edit
                                </button>
                              </li>
                            )}
                          {message.senderId === currentUser?.id && (
                            <li>
                              <button
                                className="block px-2 py-2 text-sm text-white hover:backdrop:filter hover:bg-addUserBDFH  w-full text-left"
                                onClick={() => {
                                  const confirmed = window.confirm(
                                    "Are you sure you want to delete this message?"
                                  );
                                  if (confirmed) {
                                    handleDeleteMessage(
                                      message.createdAt.nanoseconds.toString()
                                    );
                                    setMenuOpenMessageId(null);
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img
                className="max-w-[380px] max-h-[244px] rounded-lg object-cover"
                onLoad={handleImageLoad}
                src={img.url}
                alt=""
              />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom px-5 py-2 flex items-center justify-between border-t-2 border-none gap-5 mt-auto">
        <div className="icons flex gap-5">
          <label htmlFor="file">
            <img className="w-5 h-5 cursor-pointer" src="./img.png" alt="" />
          </label>
          <input
            className="hidden"
            type="file"
            id="file"
            onChange={handleImg}
          />
          <img
            className="w-5 h-5 cursor-pointer hidden"
            src="./camera.png"
            alt=""
          />
          <img
            className="w-5 h-5 cursor-pointer hidden"
            src="./mic.png"
            alt=""
          />
        </div>
        {editingMessage ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              className="flex-1 bg-searchBar border-none outline-none text-white p-4 text-base rounded-lg disabled:cursor-not-allowed"
              type="text"
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {/* <button
              className="bg-sendBtn text-white px-5 py-1.5 border-none rounded cursor-pointer"
              onClick={handleEditSubmit}
            >
              Submit Edit
            </button> */}
            <button
              className="bg-gray-500 text-white px-5 py-1.5 border-none rounded cursor-pointer"
              onClick={() => setEditingMessage(null)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <input
            className="flex-1 bg-searchBar border-none outline-none text-white p-4 text-base rounded-lg disabled:cursor-not-allowed"
            type="text"
            autoFocus
            placeholder={
              isCurrentUserBlocked || isReceiverBlocked
                ? "You cannot send a message"
                : "Type a message..."
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isCurrentUserBlocked || isReceiverBlocked} 
            ref={inputRef}
          />
        )}
        <div className="emoji relative" ref={emojiRef}>
          <img
            className="w-5 h-5 cursor-pointer"
            src="./emoji.png"
            alt=""
            onClick={() => setEmojiOpen((prev) => !prev)}
          />
          <div
            className={`picker absolute bottom-[50px] ${
              isDetailOpen ? "left-0" : "right-0"
            } `}
          >
            <EmojiPicker open={openEmoji} onEmojiClick={handleEmoji} />
          </div>
        </div>
        {!editingMessage && (
          <button
            className="sendButton bg-sendBtn text-white px-5 py-1.5 border-none rounded cursor-pointer disabled:bg-blue-300 disabled:cursor-not-allowed hidden"
            onClick={handleMessageSend}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}

export default Chat;
