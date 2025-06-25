import { useEffect, useRef, useState } from "react";
import AddUser from "./addUser/AddUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
import Lottie from "react-lottie";

import eyeAnimationData from "../../../../public/Eye.json";

interface User {
  username: string;
  email: string;
  avatar: string;
  about: string;
  id: string;
  status: string;
  blocked: string[];
}

interface ChatItem {
  username: string;
  receiverId: string;
  chatId: string;
  lastMessage: string;
  updatedAt: number;
  user: User;
  isSeen: boolean;
}

function ChatList() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatItem[]>([]);
  const [addMode, setAddMode] = useState<boolean>(false);
  const [input, setInput] = useState("");
  const addUserRef = useRef<HTMLDivElement | null>(null);
  const addUserButtonRef = useRef<HTMLImageElement | null>(null);

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
        // console.log(chatData);

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
      } catch (error) {
        if (error instanceof Error) {
          console.log(error);
        }
      }
    }
  }

  useEffect(() => {
    // console.log("triggered");

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

  // console.log(chats);

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

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: eyeAnimationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className={`flex-1 ${filteredChats.length > 0 ? "overflow-y-auto" : "overflow-hidden"}`}>
      <div className="flex items-center gap-5 p-5 border-b-2 border-none">
        {filteredChats.length > 0 && (
          <div className="flex-1 bg-searchBar flex items-center gap-5 rounded-lg p-2.5">
            <img className="w-5 h-5" src="./search.png" alt="" />
            <input
              className="bg-transparent border-none outline-none text-white flex-1"
              type="text"
              placeholder="Search"
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        )}
        {filteredChats.length > 0 ? (
          <img
            className="w-9 h-9 bg-searchBar p-2.5 rounded-lg cursor-pointer"
            src={addMode ? "./minus.png" : "./plus.png"}
            onClick={() => setAddMode((prev) => !prev)}
            alt=""
            ref={addUserButtonRef}
          />
        ) : (
          <div className="mx-auto">
            <p className="inline-block text-white mr-5">
              Click on the + icon and search for a user
            </p>
            <img
              className="w-9 h-9 inline-block bg-searchBar p-2.5 rounded-lg cursor-pointer"
              src={addMode ? "./minus.png" : "./plus.png"}
              onClick={() => setAddMode((prev) => !prev)}
              alt=""
              ref={addUserButtonRef}
            />
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
              className={`flex self-center  w-[90%] items-center gap-5 px-5 py-3 cursor-pointer border-b-2 border-none rounded-2xl ${
                chat?.isSeen
                  ? "bg-transparent hover:bg-searchBar"
                  : "bg-blue-400"
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
                    chat?.isSeen ? "text-textSub" : "text-white"
                  }`}
                >
                  {chat.lastMessage}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="">
            <p className="">Oh no!! It's so lonely here..</p>
            <div className="text-center">
              <span className="inline-block">
                <Lottie options={defaultOptions} height={24} width={24} />
              </span>
              <span className="inline-block">
                <Lottie options={defaultOptions} height={24} width={24} />
              </span>
            </div>
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
