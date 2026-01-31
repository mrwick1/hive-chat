import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { ChangeEvent, ChangeEventHandler, useEffect, useRef, useState } from "react";
import { Message } from "../../types";

interface ChatInputProps {
  text: string;
  setText: (text: string) => void;
  editingMessage: Message | null;
  setEditingMessage: (message: Message | null) => void;
  isBlocked: boolean;
  isDetailOpen: boolean;
  onSend: () => void;
  onImageSelect: ChangeEventHandler;
}

function ChatInput({
  text,
  setText,
  editingMessage,
  setEditingMessage,
  isBlocked,
  isDetailOpen,
  onSend,
  onImageSelect,
}: ChatInputProps) {
  const [openEmoji, setEmojiOpen] = useState(false);
  const emojiRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleEmoji = (e: EmojiClickData) => {
    setText(text + e.emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && text.trim()) {
      e.preventDefault();
      onSend();
      setEmojiOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(event.target as Node)
      ) {
        setEmojiOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bottom px-5 py-2 flex items-center justify-between border-t-2 border-none gap-5 mt-auto">
      <div className="icons flex gap-5">
        <label htmlFor="file">
          <img className="w-5 h-5 cursor-pointer" src="./img.png" alt="" />
        </label>
        <input
          className="hidden"
          type="file"
          id="file"
          onChange={onImageSelect as (e: ChangeEvent<HTMLInputElement>) => void}
        />
      </div>
      {editingMessage ? (
        <div className="flex-1 flex items-center gap-2">
          <input
            className="flex-1 bg-searchBar border-none outline-none text-white p-4 text-base rounded-lg disabled:cursor-not-allowed"
            type="text"
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="bg-gray-500 text-white px-5 py-1.5 border-none rounded cursor-pointer"
            onClick={() => setEditingMessage(null)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <input
          className="flex-1 bg-searchBar border-none outline-none text-white p-4 text-base rounded-lg disabled:cursor-not-allowed"
          type="text"
          autoFocus
          placeholder={
            isBlocked ? "You cannot send a message" : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isBlocked}
          ref={inputRef}
        />
      )}
      <div className="emoji relative" ref={emojiRef}>
        <img
          className="w-5 h-5 cursor-pointer"
          src="./emoji.png"
          alt=""
          onClick={() => setEmojiOpen((prev) => !prev)}
        />
        <div
          className={`picker absolute bottom-[50px] ${
            isDetailOpen ? "left-0" : "right-0"
          }`}
        >
          <EmojiPicker open={openEmoji} onEmojiClick={handleEmoji} />
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
