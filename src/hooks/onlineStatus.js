import { useEffect } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useUserStore } from '../lib/userStore';

const useOnlineStatus = () => {
    const { currentUser } = useUserStore();

    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (currentUser) {
                if (document.visibilityState === 'visible') {
                    await updateDoc(doc(db, 'users', currentUser.id), { isOnline: true });
                } else {
                    await updateDoc(doc(db, 'users', currentUser.id), { isOnline: false });
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Set online status when the component mounts
        const setOnline = async () => {
            if (currentUser) {
                await updateDoc(doc(db, 'users', currentUser.id), { isOnline: true });
            }
        };

        setOnline();

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            // Set offline status when the component unmounts
            const setOffline = async () => {
                if (currentUser) {
                    await updateDoc(doc(db, 'users', currentUser.id), { isOnline: false });
                }
            };

            setOffline();
        };
    }, [currentUser]);
};

export default useOnlineStatus;
