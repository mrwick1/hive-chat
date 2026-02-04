import { auth, db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";

interface DetailProps {
  isDetailOpen: boolean;
}

function Detail({isDetailOpen}: DetailProps) {
  const { user , isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();

  const {currentUser, updateUserStatus} = useUserStore();

  const handleBlock = async (): Promise<void> => {
    if(!user) return;

    const userDocRef = doc(db, "users", currentUser!.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id)
      })

      changeBlock()
    } catch {
      // block action failed silently
    }
  }

  const logoutHandler = async (): Promise<void> => {
    if(currentUser) await updateUserStatus(currentUser.id, "Offline");
    await auth.signOut();
    toast.success("You have successfully Logged out");
  }

  return (
    <div className={`detailFlex w-[15%] ${isDetailOpen ? "" : "hidden"}`}>
      <div className="user px-7 py-5 flex flex-col items-center gap-3 border-b border-border">
        <img className="w-[100px] h-[100px] min-w-[100px] min-h-[100px] rounded-full object-cover" src={user?.avatar || "./avatar.png"} alt="" />
        <h2 className="text-xl font-bold text-fg">{user?.username}</h2>
        <p className="text-sm text-fg-muted">{user?.about}</p>
      </div>
      <div className="flex flex-col items-center gap-3.5 p-5">
        <button className="py-1.5 w-3/5 bg-red-600 hover:bg-red-700 text-fg border-none cursor-pointer" onClick={handleBlock}>{isCurrentUserBlocked ? "You are Blocked!": isReceiverBlocked ? "User blocked" : "Block User"}</button>
        <button className="py-1.5 w-3/5 bg-accent hover:bg-blue-700 text-fg border-none cursor-pointer" onClick={logoutHandler}>Logout</button>
      </div>
    </div>
  );
}

export default Detail;
