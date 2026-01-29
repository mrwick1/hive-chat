import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";
import { User } from "../../../../types";

interface AddUserProps {
    setAddMode: (value: boolean) => void;
  }

const AddUser = ({setAddMode}: AddUserProps) => {
  const [user, setUser] = useState<User | null>(null);
    const {currentUser} = useUserStore();

    

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");

      const q = query(userRef, where("username", "==", username));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
        setUser(userDoc as User);
      }
    } catch {
      // search failed silently
    }
  };

  const handleAddUser = async () => {
    const chatRef = collection(db, "chats")
    const userChatsRef = collection(db, "userChats")

try {

    const newChatRef = doc(chatRef)
    await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
    });

    await updateDoc(doc(userChatsRef, user?.id),{
        chats:arrayUnion({
            chatId: newChatRef.id,
            lastMessage: "",
            receiverId: currentUser?.id,
            updatedAt: Date.now()
        })
    })
    await updateDoc(doc(userChatsRef, currentUser?.id),{
        chats:arrayUnion({
            chatId: newChatRef.id,
            lastMessage: "",
            receiverId: user?.id,
            updatedAt: Date.now()
        })
    })

    setAddMode(false);

} catch {
    // add user failed silently
}
  }

  return (
    <div className="addUser w-max h-max p-7 addUserBDF rounded-md absolute top-0 bottom-0 left-0 right-0 m-auto z-10 ">
      <form action="" className="flex gap-5" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Username"
          name="username"
          autoFocus
          className="px-5 text-black rounded-lg border-none outline-none"
        />
        <button className="px-5 py-2 rounded-lg bg-blue-600 text-white border-none cursor-pointer">
          Search
        </button>
      </form>
      {user && (
        <div className="user mt-8 flex items-center justify-between">
          <div className="detail flex items-center gap-5">
            <img
              className="w-[50px] h-[50px] rounded-full object-cover"
              src={user.avatar || "./avatar.png"}
              alt=""
            />
            <span>{user.username}</span>
          </div>
          <button className="px-3 py-1 rounded-lg bg-blue-600 text-white border-none cursor-pointer" onClick={handleAddUser}>
            Add User
          </button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
