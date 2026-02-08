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

    window.addEventListener("focus", handleTabFocus);
    window.addEventListener("blur", handleTabBlur);

    return () => {
      window.removeEventListener("focus", handleTabFocus);
      window.removeEventListener("blur", handleTabBlur);
    }
  }, [currentUser]);

  
if(isLoading) return (
    <div className="p-16 bg-surface-raised border border-border flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-border border-t-accent animate-spin" />
      <p className="text-sm font-mono text-fg-muted tracking-wide uppercase">Loading</p>
    </div>
  )

  return (
    <div className={`${chatId ? 'w-[90vw] min-w-[640px] max-w-[1550px]' : 'w-[55vw] min-w-[640px]'} h-[90vh] bg-surface-raised border border-border flex`}>
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
