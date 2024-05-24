import { arrayUnion, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import './addUser.css';
import { db } from '../../../../lib/firebase';
import { useState } from 'react';
import { useUserStore } from '../../../../lib/userStore';
import { toast } from 'react-toastify';

const AddUser = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { currentUser } = useUserStore();

    const handleSearch = async (e) => {
        e.preventDefault();
        setUser(null);
        setError(null);

        const formData = new FormData(e.target);
        const username = formData.get("username");

        try {
            const userRef = collection(db, "users");
            const q = query(userRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setUser(querySnapshot.docs[0].data());
            } else {
                setError('User not found');
            }
        } catch (error) {
            console.error(error);
            setError('Failed to search user');
        }
    };

    const handleAdd = async () => {
        setLoading(true);
        setError(null); // Clear any previous error

        try {
            const friendRequestsRef = doc(db, "friendRequests", user.id);

            const friendRequestsSnap = await getDoc(friendRequestsRef);

            if (friendRequestsSnap.exists()) {
                await updateDoc(friendRequestsRef, {
                    requests: arrayUnion({
                        senderId: currentUser.id,
                        senderName: currentUser.username,
                        senderAvatar: currentUser.avatar,
                        createdAt: new Date().toISOString()
                    })
                });
            } else {
                await setDoc(friendRequestsRef, {
                    requests: [
                        {
                            senderId: currentUser.id,
                            senderName: currentUser.username,
                            senderAvatar: currentUser.avatar,
                            createdAt: new Date().toISOString()
                        }
                    ]
                });
            }

            console.log("Friend request sent");
            toast.success("Friend request sent")
        } catch (error) {
            console.error("Error sending friend request:", error);
            setError('Failed to send friend request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='addUser'>
            <form onSubmit={handleSearch}>
                <input type="text" name="username" placeholder="Enter username" required />
                <button type="submit">Search</button>
            </form>
            {error && <p className="error">{error}</p>}
            {user && (
                <div className="user">
                    <div className="detail">
                        <img src={user.avatar || "./avatar.png"} alt="avatar" />
                        <span>{user.username}</span>
                    </div>
                    <button onClick={handleAdd} disabled={loading}>
                        {loading ? 'Sending...' : 'Add User'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default AddUser;

