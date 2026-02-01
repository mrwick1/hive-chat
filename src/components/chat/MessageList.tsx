import { RefObject, useEffect, useRef } from "react";
import { Message } from "../../types";
import { formatDate, isDifferentDay } from "../../utils/date";
import MessageBubble from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  currentUserId: string | undefined;
  imgPreviewUrl: string;
  menuOpenMessageId: string | null;
  menuBtnRef: RefObject<HTMLImageElement | null>;
  menuRef: RefObject<HTMLDivElement | null>;
  onToggleMenu: (messageId: string) => void;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onCloseMenu: () => void;
}

function MessageList({
  messages,
  currentUserId,
  imgPreviewUrl,
  menuOpenMessageId,
  menuBtnRef,
  menuRef,
  onToggleMenu,
  onEdit,
  onDelete,
  onCloseMenu,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void =>
    endRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageLoad = () => scrollToBottom();

  return (
    <div className="center p-5 flex-1 overflow-y-auto flex flex-col gap-2">
      {messages.map((message, index) => {
        const previousMessage = messages[index - 1];
        const showDateSeparator = isDifferentDay(message, previousMessage);

        return (
          <div key={message?.createdAt.nanoseconds}>
            <div className="flex justify-center">
              {showDateSeparator && (
                <p className="rounded-xl addUserBDF my-5 text-sm px-3 py-1">
                  {formatDate(message.createdAt)}
                </p>
              )}
            </div>

            <MessageBubble
              message={message}
              isOwn={message.senderId === currentUserId}
              menuOpen={
                menuOpenMessageId ===
                message.createdAt.nanoseconds.toString()
              }
              menuBtnRef={menuBtnRef}
              menuRef={menuRef}
              onToggleMenu={onToggleMenu}
              onEdit={onEdit}
              onDelete={onDelete}
              onCloseMenu={onCloseMenu}
              onImageLoad={handleImageLoad}
            />
          </div>
        );
      })}
      {imgPreviewUrl && (
        <div className="message own">
          <div className="texts">
            <img
              className="max-w-[380px] max-h-[244px] rounded-lg object-cover"
              onLoad={handleImageLoad}
              src={imgPreviewUrl}
              alt=""
            />
          </div>
        </div>
      )}
      <div ref={endRef}></div>
    </div>
  );
}

export default MessageList;
