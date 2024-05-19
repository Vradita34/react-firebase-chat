import { create } from 'zustand';
import { useUserStore } from './userStore';

export const useChatStore = create((set) => ({
    chatId: null,
    user: null,
    isCurrentUserBlocked: false,
    isReceiverBlocked: false,
    deleteChat: (chatId, user) => set({ chatId, user }),

    changeChat: async (chatId, user) => {
        const currentUser = useUserStore.getState().currentUser;

        // Ensure `blocked` array exists for both users
        const currentUserBlocked = currentUser.blocked || [];
        const userBlocked = user.blocked || [];

        // CHECK IF CURRENT USER IS BLOCKED
        if (userBlocked.includes(currentUser.id)) {
            return set({
                chatId,
                user: null,
                isCurrentUserBlocked: true,
                isReceiverBlocked: false,
            });
        }
        // CHECK IF RECEIVER IS BLOCKED
        else if (currentUserBlocked.includes(user.id)) {
            return set({
                chatId,
                user: user,
                isCurrentUserBlocked: false,
                isReceiverBlocked: true,
            });
        } else {
            // If no one is blocked, set the chatId and user
            return set({
                chatId,
                user,
                isCurrentUserBlocked: false,
                isReceiverBlocked: false,
            });
        }
    },

    changeBlock: () => {
        set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
    },
}));
