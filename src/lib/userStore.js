import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand'
import { db } from './firebase';

export const useUserStore = create((set) => ({
    currentUser: null,

    // boh ki error loading e
    // isLoading: true, 
    fetchUserInfo: async (uid) => {
        if (!uid) return ({ setCurrentUser: null, isLoading: false })

        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                set({ currentUser: docSnap.data(), isLoading: false })
            } else {
                set({ currentUser: null, isLoading: false })
            }
        } catch (error) {
            console.log(error)
            return self({ setCurrentUser: null, isLoading: false })
        }
    }
}))