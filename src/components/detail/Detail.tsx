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
    } catch (error) {
      if(error instanceof Error) console.log(error);
    }
  }

  

  const logoutHandler = async (): Promise<void> => {
    if(currentUser) await updateUserStatus(currentUser.id, "Offline");
    await auth.signOut();
    toast.success("You have successfully Logged out");
  }

  return (
    <div className={`detailFlex w-[15%] ${isDetailOpen ? "" : "hidden"}`}>
      <div className="user px-7 py-5 flex flex-col items-center gap-3 border-b-2 border-none">
        <img className="w-[100px] h-[100px] min-w-[100px] min-h-[100px] rounded-full object-cover" src={user?.avatar || "./avatar.png"} alt="" />
        <h2 className="text-xl font-bold">{user?.username}</h2>
        <p className="text-sm">{user?.about}</p>
      </div>
      <div className="info p-5 flex flex-col gap-5">
        <div className="option hidden">
          <div className="title flex items-center justify-between">
            <span>Chat Settings</span>
            <img className="w-[30px] h-[30px] p-2 rounded-full bg-searchBar cursor-pointer" src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option hidden">
          <div className="title flex items-center justify-between">
            <span>Privacy & Help</span>
            <img className="w-[30px] h-[30px] p-2 rounded-full bg-searchBar cursor-pointer" src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option hidden">
          <div className="title flex items-center justify-between">
            <span>Shared Photos</span>
            <img className="w-[30px] h-[30px] p-2 rounded-full bg-searchBar cursor-pointer" src="./arrowDown.png" alt="" />
          </div>
          <div className="photos flex flex-col gap-5 mt-5">
            <div className="photoItem flex items-center justify-between">
              <div className="photoDetail flex items-center gap-5">
              <img className="w-[40px] h-[40px] rounded object-cover" src="https://images.pexels.com/photos/21967688/pexels-photo-21967688/free-photo-of-portrait-of-a-pretty-brunette-wearing-a-black-dress.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load" alt="" />
              <span className="text-xs text-gray-300 font-light">photo_2024_08.png</span>
              </div>
              <img src="./download.png" alt="" className="w-[30px] h-[30px] p-2 rounded bg-searchBar cursor-pointer" />
            </div>
            <div className="photoItem flex items-center justify-between">
              <div className="photoDetail flex items-center gap-5">
              <img className="w-[40px] h-[40px] rounded object-cover" src="https://images.pexels.com/photos/21967688/pexels-photo-21967688/free-photo-of-portrait-of-a-pretty-brunette-wearing-a-black-dress.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load" alt="" />
              <span className="text-xs text-gray-300 font-light">photo_2024_08.png</span>
              </div>
              <img src="./download.png" alt="" className="w-[30px] h-[30px] p-2 rounded bg-searchBar cursor-pointer"  />
            </div>
          </div>
        </div>
        <div className="option hidden">
          <div className="title flex items-center justify-between">
            <span>Shared Files</span>
            <img className="w-[30px] h-[30px] p-2 rounded-full bg-searchBar cursor-pointer" src="./arrowUp.png" alt="" />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3.5">
      <button className="py-1.5 w-3/5 bg-red-500 hover:bg-red-800 text-white border-none rounded cursor-pointer" onClick={handleBlock}>{isCurrentUserBlocked ? "You are Blocked!": isReceiverBlocked ? "User blocked" : "Block User"}</button>
      <button className="py-1.5 w-3/5 bg-blue-500 hover:bg-blue-800 text-white border-none rounded cursor-pointer" onClick={logoutHandler}>Logout</button>
      </div>
        
    </div>
  );
}

export default Detail;
