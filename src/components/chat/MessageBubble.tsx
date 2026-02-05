import { RefObject } from "react";
import { MoreHorizontal } from "lucide-react";
import { Message } from "../../types";
import MessageContextMenu from "./MessageContextMenu";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  menuOpen: boolean;
  menuBtnRef: RefObject<HTMLButtonElement | null>;
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
            } flex gap-5 object-cover`}
            onLoad={onImageLoad}
            src={message.img}
          />
        )}
        <p className="sm:max-w-[60%] max-w-fit max-w-fit-plus-30 min-w-28 min-h-6 relative">
          <span className="message-text">{message.text}</span>
          <span className="flex items-center">
            <span
              className={`mx-2 absolute bottom-[2px] ${
                isOwn ? "right-2" : "right-0"
              } text-xxs text-fg-muted font-mono`}
            >
              {message.createdAt &&
                message.createdAt.toDate().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </span>
            {isOwn && (
              <button
                className="absolute bottom-[2.5px] right-0 cursor-pointer bg-transparent border-none text-fg-muted hover:text-fg inline-block ml-1 mb-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMenu(messageId);
                }}
                ref={menuBtnRef}
              >
                <MoreHorizontal size={10} />
              </button>
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
