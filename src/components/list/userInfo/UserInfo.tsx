import { toast } from "react-toastify";
import { auth } from "../../../lib/firebase";
import { useUserStore } from "../../../lib/userStore";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import EditAbout from "../chatList/editAbout/EditAbout";
import { useEffect, useRef, useState } from "react";
function UserInfo() {
  const [isEditAboutOpen, setIsEditAboutOpen] = useState(false);
  const editAboutRef = useRef<HTMLDivElement | null>(null); 
  const editButtonRef = useRef<HTMLImageElement | null>(null);


  const { currentUser, updateUserStatus } = useUserStore();

  const optionClickHandler = async () => {
    if(currentUser) await updateUserStatus(currentUser.id, "Offline");
    await auth.signOut();
    toast.success("You have successfully Logged out");
  };

  const handleAbout = () => setIsEditAboutOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editAboutRef.current &&
        !editAboutRef.current.contains(event.target as Node) && editButtonRef.current &&
        !editButtonRef.current.contains(event.target as Node)
      ) {
        setIsEditAboutOpen(false);
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
        <h2 className="text-xl	font-bold">{currentUser?.username}</h2>
        <p className="text-xs font-normal text-gray-400">{currentUser?.about}</p>
        </div>
        
      </div>
      <div className="flex gap-5">
        <Menu as="div" className="relative">
          <MenuButton>
            <img className="w-5 h-5 cursor-pointer" src="./more.png" alt="" />
            <MenuItems
              transition
              className="absolute right-0 z-10 mt-1 w-32 origin-top-right rounded-md bg-searchBar shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="py-1">
                <MenuItem>
                  <p
                    className="block px-4 py-1 text-sm text-white data-[focus]:bg-searchBar data-[focus]:text-slate-200"
                    onClick={optionClickHandler}
                  >
                    Logout
                  </p>
                </MenuItem>
              </div>
            </MenuItems>
          </MenuButton>
        </Menu>
        <img
          className="w-5 h-5 cursor-pointer hidden"
          src="./video.png"
          alt=""
        />
        <img
          className="w-5 h-5 cursor-pointer"
          src="./edit.png"
          onClick={handleAbout}
          alt=""
          ref={editButtonRef}
        />
      </div>
      
    </div>
    {isEditAboutOpen && (
        <div ref={editAboutRef}> {/* Reference added to the EditAbout wrapper */}
          <EditAbout setIsEditAboutOpen={setIsEditAboutOpen}  />
        </div>
      )}
    </div>
    
  );
}

export default UserInfo;
