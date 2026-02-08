import { useEffect, useRef, useState } from "react";
import AddUser from "./addUser/AddUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
import { MessageCircle, Search, Plus, Minus } from "lucide-react";
import { ChatItem } from "../../../types";

function ChatList() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatItem[]>([]);
  const [addMode, setAddMode] = useState<boolean>(false);
  const [input, setInput] = useState("");
  const addUserRef = useRef<HTMLDivElement | null>(null);
  const addUserButtonRef = useRef<HTMLButtonElement | null>(null);

  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userChats", currentUser!.id),
      async (res) => {
        const items = res.data()?.chats || [];

        const promises = items.map(async (item: ChatItem) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();
          return { ...item, user };
        });
        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser?.id]);

  async function handleSelect(chat: ChatItem): Promise<void> {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen = true;

    if (currentUser) {
      const userChatsRef = doc(db, "userChats", currentUser.id);

      try {
        await updateDoc(userChatsRef, {
          chats: userChats,
        });
        changeChat(chat.chatId, chat.user);
      } catch {
        // chat selection failed silently
      }
    }
  }

  useEffect(() => {
    if (input) {
      const filtered = chats.filter((c) =>
        c.user.username
          ? c.user.username.toLowerCase().includes(input.toLowerCase())
          : false
      );

      setFilteredChats(filtered);
    } else {
      setFilteredChats(chats);
    }
  }, [input, chats]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addUserRef.current &&
        !addUserRef.current.contains(event.target as Node) &&
        addUserButtonRef.current &&
        !addUserButtonRef.current.contains(event.target as Node)
      ) {
        setAddMode(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`flex-1 ${filteredChats.length > 0 ? "overflow-y-auto" : "overflow-hidden"}`}>
      <div className="flex items-center gap-5 p-5 border-b border-border">
        {filteredChats.length > 0 && (
          <div className="flex-1 bg-surface-overlay border border-border flex items-center gap-5 p-2.5">
            <Search size={20} className="text-fg-muted" />
            <input
              className="bg-transparent border-none outline-none text-fg flex-1"
              type="text"
              placeholder="Search"
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        )}
        {filteredChats.length > 0 ? (
          <button
            className="w-9 h-9 bg-surface-overlay border border-border p-2 cursor-pointer text-fg flex items-center justify-center"
            onClick={() => setAddMode((prev) => !prev)}
            ref={addUserButtonRef}
          >
            {addMode ? <Minus size={16} /> : <Plus size={16} />}
          </button>
        ) : (
          <div className="mx-auto flex items-center gap-4">
            <p className="inline-block text-sm text-fg-muted">
              Search for a user to start chatting
            </p>
            <button
              className="w-9 h-9 inline-flex items-center justify-center bg-surface-overlay border border-border p-2 cursor-pointer text-fg"
              onClick={() => setAddMode((prev) => !prev)}
              ref={addUserButtonRef}
            >
              {addMode ? <Minus size={16} /> : <Plus size={16} />}
            </button>
          </div>
        )}
      </div>
      <div
        className={`flex flex-col ${
          filteredChats.length > 0 ? "" : "h-full justify-center items-center"
        }`}
      >
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              className={`flex self-center w-[90%] items-center gap-5 px-5 py-3 cursor-pointer border-b border-border ${
                chat?.isSeen
                  ? "bg-transparent hover:bg-surface-overlay"
                  : "bg-accent"
              }`}
              key={chat.chatId}
              onClick={() => handleSelect(chat)}
            >
              <img
                className="min-w-[50px] min-h-[50px] w-[50px] h-[50px] rounded-full object-cover"
                src={
                  chat.user.blocked.includes(currentUser!.id)
                    ? "./avatar.png"
                    : chat.user.avatar || "./avatar.png"
                }
                alt=""
              />
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">
                  {chat.user.blocked.includes(currentUser!.id)
                    ? "User"
                    : chat.user.username}
                </span>
                <p
                  className={`text-sm font-normal whitespace-nowrap 2xl:max-w-[280px] xl:max-w-[200px] lg:max-w-[150px] md:max-w-[100px] sm:max-w-[50px] max-w-[30px] text-ellipsis overflow-hidden ${
                    chat?.isSeen ? "text-fg-muted" : "text-fg"
                  }`}
                >
                  {chat.lastMessage}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center gap-3 text-fg-muted p-8">
            <MessageCircle size={40} strokeWidth={1} />
            <p className="text-sm font-mono tracking-wide">No conversations yet</p>
          </div>
        )}
      </div>
      <div ref={addUserRef}>
        {addMode && <AddUser setAddMode={setAddMode} />}
      </div>
    </div>
  );
}

export default ChatList;
