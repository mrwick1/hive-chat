import { RefObject } from "react";
import { Message } from "../../types";
import MessageContextMenu from "./MessageContextMenu";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  menuOpen: boolean;
  menuBtnRef: RefObject<HTMLImageElement | null>;
  menuRef: RefObject<HTMLDivElement | null>;
  onToggleMenu: (messageId: string) => void;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onCloseMenu: () => void;
  onImageLoad: () => void;
}

function MessageBubble({
  message,
  isOwn,
  menuOpen,
  menuBtnRef,
  menuRef,
  onToggleMenu,
  onEdit,
  onDelete,
  onCloseMenu,
  onImageLoad,
}: MessageBubbleProps) {
  const messageId = message.createdAt.nanoseconds.toString();

  return (
    <div
      className={`${isOwn ? "message own" : "message"} flex gap-5`}
    >
      <div className="texts flex-1 flex flex-col gap-1.5">
        {message.img && (
          <img
            className={`max-w-[380px] max-h-[244px] ${
              isOwn ? "message own" : "message"
            } flex gap-5 rounded-lg object-cover`}
            onLoad={onImageLoad}
            src={message.img}
          />
        )}
        <p className="rounded-lg sm:max-w-[60%] max-w-fit max-w-fit-plus-30 min-w-28 min-h-6 relative">
          <span className="message-text">{message.text}</span>
          <span className="flex items-center">
            <span
              className={`mx-2 absolute bottom-[2px] ${
                isOwn ? "right-2" : "right-0"
              } text-xxs text-slate-200`}
            >
              {message.createdAt &&
                message.createdAt.toDate().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </span>
            {isOwn && (
              <img
                className="w-[10px] h-[10px] absolute bottom-[2.5px] right-0 cursor-pointer inline-block ml-1 mb-1"
                src="./more1.png"
                alt="More options"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMenu(messageId);
                }}
                ref={menuBtnRef}
              />
            )}
          </span>
          {menuOpen && (
            <MessageContextMenu
              message={message}
              menuRef={menuRef}
              onEdit={onEdit}
              onDelete={onDelete}
              onClose={onCloseMenu}
            />
          )}
        </p>
      </div>
    </div>
  );
}

export default MessageBubble;
