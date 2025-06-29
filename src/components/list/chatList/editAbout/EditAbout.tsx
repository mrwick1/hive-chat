import { doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "../../../../lib/firebase";
import { useUserStore } from "../../../../lib/userStore";

interface EditAboutProps {
  setIsEditAboutOpen: (value: boolean) => void;
}


const EditAbout = ({setIsEditAboutOpen}: EditAboutProps) => {
  const { currentUser } = useUserStore();

  const handleAboutChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const about = formData.get("about") as string | null;

    if (!about || about.trim() === "")
      return toast.warn(
        "You have not added anything to describe about yourself! 😢"
      );

    if (!currentUser?.id)
      return toast.error("User ID is missing! Please try again.");

    const userDocRef = doc(db, "users", currentUser?.id);
    
    try {
      await updateDoc(userDocRef, {
        about: about,
      });

      setIsEditAboutOpen(false);
    } catch (error) {
      if (error instanceof Error) console.log(error);
    }
  };

  return (
    <div className="editAbout w-max h-max p-10 addUserBDF rounded-2xl absolute top-0 bottom-0 left-0 right-0  m-auto z-10">
      <form
        action=""
        className="flex flex-col gap-4"
        onSubmit={handleAboutChange}
      >
        <label htmlFor="about" className="">
          Add About{" "}
        </label>
        <input
          type="text"
          placeholder="Eg: I am available"
          autoFocus
          name="about"
          className="px-5 py-3 w-[300px] text-black rounded-lg border-none outline-none"
        />

        <button className="px-2 py-2 w-[70px] rounded-lg bg-blue-600 self-end text-white border-none cursor-pointer">
          Save
        </button>
      </form>
    </div>
  );
};

export default EditAbout;
