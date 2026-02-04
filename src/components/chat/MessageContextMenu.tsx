import { RefObject } from "react";
import { Message } from "../../types";

interface MessageContextMenuProps {
  message: Message;
  menuRef: RefObject<HTMLDivElement | null>;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onClose: () => void;
}

function MessageContextMenu({
  message,
  menuRef,
  onEdit,
  onDelete,
  onClose,
}: MessageContextMenuProps) {
  return (
    <div
      className="absolute right-0 mt-3 w-32 bg-surface-overlay border border-border shadow-lg z-10"
      ref={menuRef}
    >
      <ul className="py-1">
        {(message.editable ?? false) && (
          <li>
            <button
              className="block px-2 py-2 text-sm text-fg hover:bg-surface-raised w-full text-left"
              onClick={() => {
                onEdit(message);
                onClose();
              }}
            >
              Edit
            </button>
          </li>
        )}
        <li>
          <button
            className="block px-2 py-2 text-sm text-white hover:bg-addUserBDFH w-full text-left"
            onClick={() => {
              const confirmed = window.confirm(
                "Are you sure you want to delete this message?"
              );
              if (confirmed) {
                onDelete(message.createdAt.nanoseconds.toString());
                onClose();
              }
            }}
          >
            Delete
          </button>
        </li>
      </ul>
    </div>
  );
}

export default MessageContextMenu;
