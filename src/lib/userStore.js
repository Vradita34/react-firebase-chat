import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand'
import { db } from './firebase';

export const useUserStore = create((set) => ({
    currentUser: null,
    isLoading: true,
    fetchUserInfo: async (uid) => {
        if (!uid) {
            set({ currentUser: null, isLoading: false }); // Setelah memeriksa uid, atur isLoading ke false
            return; // Kembalikan dari fungsi setelah mengatur state
        }

        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                set({ currentUser: docSnap.data(), isLoading: false })
            } else {
                set({ currentUser: null, isLoading: false })
            }
        } catch (error) {
            console.log(error);
            set({ currentUser: null, isLoading: false }); // Atur isLoading ke false dalam kasus kesalahan
        }
    }
}));
