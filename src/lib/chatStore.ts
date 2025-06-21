import { create } from "zustand";
import { useUserStore } from "./userStore";

interface User {
  username: string;
  email: string;
  avatar: string;
  about: string;
  id: string;
  status: string;
  blocked: string[];
}

interface ChatStore {
  chatId: string | null;
  user: User | null;
  isCurrentUserBlocked: boolean;
  isReceiverBlocked: boolean;
  changeChat: (chatId: string | null, user: User | null) => void;
  changeBlock: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;

    // CHECK IF CURRENT USER IS BLOCKED

    if (user!.blocked.includes(currentUser!.id)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      });
    }

    // CHECK IF CURRENT RECEIVER IS BLOCKED
    else if (currentUser!.blocked.includes(user!.id)) {
      return set({
        chatId,
        user: user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      });
    } else {
      return set({
        chatId,
        user: user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      });
    }
  },
  changeBlock: () => {
    set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
  },
}));
