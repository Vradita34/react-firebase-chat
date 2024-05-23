import './userinfo.css'
import { useUserStore } from "../../../lib/userStore";
import Profile from './profile/Profile';
import { useState } from 'react';

function Userinfo() {
    const [addProfile, setAddProfile] = useState(false);
    const { currentUser } = useUserStore()

    return (
        <div className='userinfo'>
            <div className="user">
                <img src={currentUser.avatar || "./avatar.png"} alt="" />
                <h2>{currentUser.username}</h2>
            </div>


            <div className="icons">
                <img src="./more.png" alt="" onClick={() => setAddProfile((prev) => !prev)} />
                <img src="./edit.png" alt="" />
            </div>
            {addProfile && <Profile onClose={() => setAddProfile(false)} />}
        </div>
    )
}

export default Userinfo