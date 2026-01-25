import { toast } from "react-toastify";
import { auth } from "../../../lib/firebase";
import { useUserStore } from "../../../lib/userStore";
import { MoreVertical, Pencil } from "lucide-react";
import EditAbout from "../chatList/editAbout/EditAbout";
import { useEffect, useRef, useState } from "react";

function UserInfo() {
  const [isEditAboutOpen, setIsEditAboutOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const editAboutRef = useRef<HTMLDivElement | null>(null);
  const editButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  const { currentUser, updateUserStatus } = useUserStore();

  const optionClickHandler = async () => {
    if (currentUser) await updateUserStatus(currentUser.id, "Offline");
    await auth.signOut();
    toast.success("You have successfully Logged out");
  };

  const handleAbout = () => setIsEditAboutOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editAboutRef.current &&
        !editAboutRef.current.contains(event.target as Node) &&
        editButtonRef.current &&
        !editButtonRef.current.contains(event.target as Node)
      ) {
        setIsEditAboutOpen(false);
      }
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <img
            className="w-[50px] h-[50px] min-w-[50px] min-h-[50px] rounded-[50%] object-cover"
            src={currentUser?.avatar || "./avatar.png"}
            alt=""
          />
          <div className="flex flex-col">
            <h2 className="text-xl font-bold">{currentUser?.username}</h2>
            <p className="text-xs font-normal text-gray-400">
              {currentUser?.about}
            </p>
          </div>
        </div>
        <div className="flex gap-5">
          <div className="relative" ref={menuRef}>
            <button
              className="cursor-pointer bg-transparent border-none text-white"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              ref={menuButtonRef}
            >
              <MoreVertical size={20} />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 z-10 mt-1 w-32 rounded-md bg-searchBar shadow-lg">
                <div className="py-1">
                  <p
                    className="block px-4 py-1 text-sm text-white cursor-pointer hover:bg-chatscreen2"
                    onClick={() => {
                      optionClickHandler();
                      setIsMenuOpen(false);
                    }}
                  >
                    Logout
                  </p>
                </div>
              </div>
            )}
          </div>
          <button
            className="cursor-pointer bg-transparent border-none text-white"
            onClick={handleAbout}
            ref={editButtonRef}
          >
            <Pencil size={20} />
          </button>
        </div>
      </div>
      {isEditAboutOpen && (
        <div ref={editAboutRef}>
          <EditAbout setIsEditAboutOpen={setIsEditAboutOpen} />
        </div>
      )}
    </div>
  );
}

export default UserInfo;
