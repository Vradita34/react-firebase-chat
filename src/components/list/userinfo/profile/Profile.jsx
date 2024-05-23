import { useState } from 'react';
import { toast } from 'react-toastify';
import { auth, db } from '../../../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useUserStore } from '../../../../lib/userStore';
import './profile.css';
import upload from '../../../../lib/upload';
import { signOut } from 'firebase/auth';

function Profile({ onClose }) {
    const { currentUser } = useUserStore();
    const [editing, setEditing] = useState(false);
    const [newUsername, setNewUsername] = useState(currentUser.username || '');
    const [newInfo, setNewInfo] = useState(currentUser.info || '');
    const [newAvatar, setNewAvatar] = useState(null);
    const [oldAvatar, setOldAvatar] = useState(currentUser.avatar || "");

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

    const handleEditProfile = () => {
        setEditing(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userRef = doc(db, 'users', currentUser.id);
            const updates = {
                username: newUsername,
                info: newInfo,
            };
            if (newAvatar) {
                const imgUrl = await upload(newAvatar);
                updates.avatar = imgUrl;
            } else {
                updates.avatar = oldAvatar; // Use old avatar if no new avatar selected
            }
            await updateDoc(userRef, updates);

            toast.success('Profile updated successfully!');
            setEditing(false); // Exit editing mode
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile.');
        }
    };

    const handleChangeAvatar = (e) => {
        if (e.target.files[0]) {
            setNewAvatar(e.target.files[0]);
            setOldAvatar(URL.createObjectURL(e.target.files[0]));
        }
    };

    return (
        <div className='profile'>
            <div className="modal">
                <div className="modal-content">
                    <div className="modal-header">
                        {editing ? (
                            <img src="./save.gif" alt="Save" onClick={handleSubmit} />
                        ) : (
                            <img src="./edit.png" alt="Edit" onClick={handleEditProfile} />
                        )}
                        <img src="./closered.png" alt="Close" onClick={onClose} />
                    </div>
                    <div className="user">
                        <img src={editing ? oldAvatar : currentUser.avatar || "./avatar.png"} alt="avatar" />
                        {editing ? (
                            <>
                                <input type="file" onChange={handleChangeAvatar} />
                                <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                                <textarea value={newInfo} onChange={(e) => setNewInfo(e.target.value)} />
                            </>
                        ) : (
                            <>
                                <h2>{currentUser.username || "anonim"}</h2>
                                <p>{currentUser.info}</p>
                            </>
                        )}
                    </div>
                    <div className="info">
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
                        <div className="option">
                            <div className="title">
                                <span>Shared Files</span>
                                <img src="./arrowUp.png" alt="arrowUp" />
                            </div>
                        </div>
                        <button className='logout' onClick={handleLogout}>Log Out</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
