import { create } from 'zustand'
import { db } from './firebase'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { User } from '../types';

interface UserStore {
  currentUser: User | null;
  isLoading: boolean;
  fetchUserInfo: (uid: string) => void;
  unsubscribeUserInfo: () => void;
  updateUserStatus: (uid: string, status: string) => Promise<void>;
}

let unsubscribe: (() => void) | null = null;

export const useUserStore = create<UserStore>((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo(uid: string) {
    if (!uid) return set({ currentUser: null, isLoading: false });

    const docRef = doc(db, "users", uid);

    if (unsubscribe) {
      unsubscribe();
    }

    set({ isLoading: true });

    unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data() as User;
        set({ currentUser: userData, isLoading: false });
      } else {
        set({ currentUser: null, isLoading: false });
      }
    }, () => {
      set({ currentUser: null, isLoading: false });
    });
  },
  unsubscribeUserInfo: () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  },
  async updateUserStatus(cUser: string, userStatus: string): Promise<void> {
    if (!cUser) return;
    const userDocRef = doc(db, "users", cUser);

    try {
      await updateDoc(userDocRef, {
        status: userStatus,
      });
    } catch {
      // status update failed silently
    }
  }
}))
