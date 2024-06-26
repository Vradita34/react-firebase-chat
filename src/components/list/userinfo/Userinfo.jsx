import './userinfo.css';
import { useUserStore } from "../../../lib/userStore";
import Profile from './profile/Profile';
import { useEffect, useState } from 'react';
import FriendRequestModal from '../chatlist/addUser/requestModal/FriendRequestModal';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

function Userinfo() {
    const [addProfile, setAddProfile] = useState(false);
    const [showFriendRequests, setShowFriendRequests] = useState(false);
    const [requestCount, setRequestCount] = useState(0);
    const { currentUser } = useUserStore();

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "friendRequests", currentUser.id), (doc) => {
            if (doc.exists()) {
                setRequestCount(doc.data().requests?.length || 0);
            }
        });

        return () => unsubscribe();
    }, [currentUser.id]);

    const handleProfileClick = () => {
        setAddProfile(prev => !prev);
    };

    const handleFriendRequestsClick = () => {
        setShowFriendRequests(prev => !prev);
    };

    return (
        <div className='userinfo'>
            <div className="user">
                <img src={currentUser.avatar || "./avatar.png"} alt="" />
                <h2>{currentUser.username}</h2>
            </div>
            <div className="notification">
                <div className="bell-container">
                    <div className="bell"></div>
                </div>
            </div>

            <div className="icons">
                <img src="./user.png" alt="" onClick={handleProfileClick} />
                <div className="message-icon-container" onClick={handleFriendRequestsClick}>
                    <img src="./message.png" alt="" />
                    {requestCount > 0 && <span className="badge">{requestCount}</span>}
                </div>
            </div>
            {addProfile && <Profile onClose={() => setAddProfile(false)} />}
            {showFriendRequests && <FriendRequestModal onClose={() => setShowFriendRequests(false)} />}
        </div>
    );
}

export default Userinfo;
