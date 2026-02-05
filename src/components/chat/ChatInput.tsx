import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { ChangeEvent, ChangeEventHandler, useEffect, useRef, useState } from "react";
import { ImagePlus, Smile } from "lucide-react";
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
    <div className="bottom px-5 py-2 flex items-center justify-between border-t border-border gap-5 mt-auto">
      <div className="icons flex gap-5">
        <label htmlFor="file" className="cursor-pointer text-fg-muted hover:text-fg">
          <ImagePlus size={20} />
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
            className="flex-1 bg-surface-overlay border border-border outline-none text-fg p-4 text-base disabled:cursor-not-allowed"
            type="text"
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="bg-surface-overlay text-fg-muted px-5 py-1.5 border border-border cursor-pointer hover:text-fg"
            onClick={() => setEditingMessage(null)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <input
          className="flex-1 bg-surface-overlay border border-border outline-none text-fg p-4 text-base disabled:cursor-not-allowed"
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
        <button
          className="cursor-pointer bg-transparent border-none text-fg-muted hover:text-fg"
          onClick={() => setEmojiOpen((prev) => !prev)}
        >
          <Smile size={20} />
        </button>
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
