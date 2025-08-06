import { useEffect, useState } from "react";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";


function App() {
const {currentUser, isLoading, fetchUserInfo, updateUserStatus} = useUserStore();

const {chatId} = useChatStore();

const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid || "")
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  

useEffect(() => {
    if(!currentUser) return;

    const handleTabFocus = () => {
      updateUserStatus(currentUser.id, "Online");
    }

    const handleTabBlur = () => {
      updateUserStatus(currentUser.id, "Away");
    }

    // const handleWindowClose = () => {
    //   updateUserStatus(currentUser.id, "offline")
    // }

    window.addEventListener("focus", handleTabFocus);
    window.addEventListener("blur", handleTabBlur);
    // window.addEventListener("beforeunload", handleWindowClose);

    return () => {
      window.removeEventListener("focus", handleTabFocus);
    window.removeEventListener("blur", handleTabBlur);
    // window.removeEventListener("beforeunload", handleWindowClose);
    }
  }, [currentUser]);

  
if(isLoading) return <div className="loading p-7 text-4xl rounded-lg bg-chatscreen2">Loading...</div>

  return (
    <div className={`${chatId ? 'w-[90vw] min-w-[640px] max-w-[1550px]' : 'w-[55vw] min-w-[640px]'}    h-[90vh] bg-chatscreen2 rounded-3xl flex`}>
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat setIsDetailOpen={setIsDetailOpen} isDetailOpen={isDetailOpen} />}
          {chatId && <Detail isDetailOpen={isDetailOpen} />}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
}

export default App;
