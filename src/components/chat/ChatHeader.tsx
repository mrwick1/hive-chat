import { User } from "../../types";

interface ChatHeaderProps {
  user: User | null;
  otherUserStatus: string | undefined;
  onToggleDetail: () => void;
}

function ChatHeader({ user, otherUserStatus, onToggleDetail }: ChatHeaderProps) {
  return (
    <div className="top px-4 pt-5 pb-3 flex items-center justify-between border-b-2 border-none">
      <div className="user flex items-center gap-5">
        <img
          className="w-[45px] h-[45px] rounded-full object-cover"
          src={user?.avatar || "./avatar.png"}
          alt=""
        />
        <div className="texts flex flex-col gap-0.5">
          <span className="text-lg font-bold">
            {user?.username}{" "}
            <span className="text-xs font-light text-gray-200 ml-2">
              {otherUserStatus}
            </span>
          </span>
          <p className="text-xs font-normal text-gray-400">{user?.about}</p>
        </div>
      </div>
      <div className="icons flex gap-5">
        <img
          className="w-5 h-5 cursor-pointer"
          src="./info.png"
          onClick={onToggleDetail}
          alt=""
        />
      </div>
    </div>
  );
}

export default ChatHeader;
