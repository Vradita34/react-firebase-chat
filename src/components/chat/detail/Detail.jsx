import { toast } from 'react-toastify';
import { auth, db } from '../../../lib/firebase';
import './detail.css';
import { useChatStore } from '../../../lib/chatStore';
import { useUserStore } from '../../../lib/userStore';
import { arrayRemove, arrayUnion, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

function Detail({ onClose }) {
    const { user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, deleteChat } = useChatStore();
    const { currentUser } = useUserStore();

    const handleBlock = async () => {
        if (!user) return;

        const userDocRef = doc(db, "users", currentUser.id);

        try {
            await updateDoc(userDocRef, {
                blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
            });
            changeBlock();
        } catch (error) {
            console.log(error);
        }
    };

    const handleDeleteFriend = async () => {
        if (!user) return;

        const currentUserChatDoc = doc(db, "userchats", currentUser.id);
        const friendUserChatDoc = doc(db, "userchats", user.id);

        try {
            // Fetch the current user's chat data
            const currentUserChatSnapshot = await getDoc(currentUserChatDoc);
            if (currentUserChatSnapshot.exists()) {
                const currentUserChats = currentUserChatSnapshot.data().chats || [];

                // Find the chat ID related to the friend
                const chat = currentUserChats.find(c => c.receiverId === user.id);
                if (chat) {
                    // Remove the chat relationship from the current user
                    await updateDoc(currentUserChatDoc, {
                        chats: arrayRemove(chat),
                    });

                    // Remove the chat relationship from the friend user
                    const friendUserChatSnapshot = await getDoc(friendUserChatDoc);
                    if (friendUserChatSnapshot.exists()) {
                        const friendUserChats = friendUserChatSnapshot.data().chats || [];
                        const friendChat = friendUserChats.find(c => c.receiverId === currentUser.id);
                        if (friendChat) {
                            await updateDoc(friendUserChatDoc, {
                                chats: arrayRemove(friendChat),
                            });
                        }
                    }

                    // Optionally, delete the chat document
                    const chatDocRef = doc(db, "chats", chat.chatId);
                    await deleteDoc(chatDocRef);

                    // Remove any pending friend requests
                    await updateDoc(doc(db, "friendRequests", currentUser.id), {
                        requests: arrayRemove({ senderId: user.id })
                    });
                    await updateDoc(doc(db, "friendRequests", user.id), {
                        requests: arrayRemove({ senderId: currentUser.id })
                    });
                    toast.success("Friend deleted successfully");
                    window.location.href = "/";
                }
            }
        } catch (error) {
            console.error('Error deleting friend:', error);
            toast.error(error);
        }
    };

    const handleLogout = async (e) => {
        e.preventDefault();

        try {
            await signOut(auth);

            const userDocRef = doc(db, "users", currentUser.id);
            await updateDoc(userDocRef, {
                isOnline: false,
            });

            console.log('Logout successful');
            toast.success("Logout Successful!");
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
                        <button onClick={handleDeleteFriend}>Delete Friend</button>
                        <button className='logout' onClick={handleLogout}>Log Out</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Detail;
