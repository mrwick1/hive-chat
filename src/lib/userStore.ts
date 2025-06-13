import { create } from 'zustand'
import { db } from './firebase'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

interface User {
    username: string;
    email: string;
    avatar: string;
    about: string;
    id: string;
    status: string;
    blocked: string[];
  }
  
  interface UserStore {
    currentUser: User | null;
    isLoading: boolean;
    // fetchUserInfo: (uid: string) => Promise<void>;
    fetchUserInfo: (uid: string) => void;
    // setUserStatus: (uid: string, status: string) => Promise<void>;
    unsubscribeUserInfo: () => void;
    updateUserStatus: (uid: string, status: string) => Promise<void>;
  }

  let unsubscribe: (() => void) | null = null;

export const useUserStore = create<UserStore>((set) => ({
  currentUser: null,
  isLoading: true,
  // fetchUserInfo: async (uid: string) => {
  //   if(!uid) return set({currentUser: null, isLoading: false})
  //       try {
  //           const docRef = doc(db, "users", uid);
  //           const docSnap = await getDoc(docRef)

  //           if(docSnap.exists()) {
  //               const userData = docSnap.data() as User;
  //               set({currentUser: userData, isLoading: false})
  //           } else {
  //               set({currentUser: null, isLoading: false})
  //           }
  //       } catch (error) {
  //           return set({currentUser: null, isLoading: false})
  //       }
  // }
  // updateUserStatus : async (uid: string, status: string) => {
  //   const userRef = doc(db, "users", uid);
  //   await updateDoc(userRef, {
  //     status, // Update the user's status
  //     lastSeen: serverTimestamp(), // Update the last seen time
  //   });
  // },
  fetchUserInfo(uid: string) {
    if (!uid) return set({ currentUser: null, isLoading: false });

    const docRef = doc(db, "users", uid);

    if (unsubscribe) {
      unsubscribe();
    }

    set({ isLoading: true });

    // this.updateUserStatus(uid, "active");

    unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data() as User;
        set({ currentUser: userData, isLoading: false });
      } else {
        set({ currentUser: null, isLoading: false });
      }
    }, (error) => {
      console.error("Error fetching user data:", error);
      set({ currentUser: null, isLoading: false });
    });
  },
  unsubscribeUserInfo: () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  },
  async updateUserStatus (cUser: string, userStatus: string): Promise<void> {
    const userDocRef = doc(db, "users", cUser);
    
    try {
      await updateDoc(userDocRef, {
        status: userStatus,
      });
    } catch(err) { 
    if(err instanceof Error) console.log(err)
    }
  }
}))
