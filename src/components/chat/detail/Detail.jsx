
import { toast } from 'react-toastify';
import { auth, db } from '../../../lib/firebase'
import './detail.css'
import { useChatStore } from '../../../lib/chatStore';
import { useUserStore } from '../../../lib/userStore';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

function Detail({ onClose }) {
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore()
    const { currentUser } = useUserStore()

    const handleBlock = async () => {
        if (!user) return;

        const userDocRef = doc(db, "users", currentUser.id)

        try {
            await updateDoc(userDocRef, {
                blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
            })
            changeBlock()
        } catch (error) {
            console.log(error)
        }
    }

    const handleLogout = async (e) => {
        e.preventDefault();

        try {
            // Sign out the user
            await signOut(auth);

            // Update isOnline to false for the user in the users collection
            const userDocRef = doc(db, "users", currentUser.id);
            await updateDoc(userDocRef, {
                isOnline: false,
            });

            console.log('Logout successful');
            toast.success("LogOut Successful!");
            // Temporary redirect, consider React Router for better navigation
            window.location.href = "/";
        } catch (error) {
            console.error('Error logging out:', error);
            toast.error(error.message);
        }
    };

    return (
        <div className='detail'>
            <div className="modal">
                <div className="modal-content">
                    <div className="modal-header">
                        <img src="./closered.png" alt="close" onClick={onClose} />
                    </div>
                    <div className="user">
                        <img src={user?.avatar || "./avatar.png"} alt="avatar" />
                        <h2>{user?.username || "anonim"}</h2>
                        <p>{user.info ? user?.info : "no Info"}</p>
                    </div>
                    <div className="info">
                        <div className="option">
                            <div className="title">
                                <p><span>Email :</span> {user?.email}</p>
                            </div>
                        </div>
                        <div className="option">
                            <div className="title">
                                <span>Settings</span>
                                <img src="./arrowUp.png" alt="arrowUp" />
                            </div>
                        </div>
                        <div className="option">
                            <div className="title">
                                <span>Privacy & helps</span>
                                <img src="./arrowUp.png" alt="arrowUp" />
                            </div>
                        </div>
                        <button onClick={handleBlock}>
                            {isCurrentUserBlocked ? "You are Blocked" : isReceiverBlocked ? "User Blocked" : "Block User"}
                        </button>
                        <button className='logout' onClick={handleLogout}>Log Out</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Detail