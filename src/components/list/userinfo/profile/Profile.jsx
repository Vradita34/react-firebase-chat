import { toast } from 'react-toastify';
import { auth } from '../../../../lib/firebase';
import { useUserStore } from '../../../../lib/userStore'
import './profile.css'

function Profile({ onClose }) {

    const { currentUser } = useUserStore()

    const handleLogout = (e) => {
        e.preventDefault()
        auth.signOut()
            .then(() => {
                console.log('Logout successful');
                toast.success("LogOut Successful!")

                // sementara, puyeng, diakalisek
                window.location.href = "/";
            })
            .catch((error) => {
                console.error('Error logging out:', error);
                toast.error(error.message)
            });
    };


    return (
        <div className='profile'>
            <div className="modal">
                <div className="modal-content">
                    <div className="modal-header">
                        <img src="./closered.png" alt="close" onClick={onClose} />
                    </div>
                    <div className="user">
                        <img src={currentUser.avatar || "./avatar.png"} alt="avatar" />
                        <h2>{currentUser.username || "anonim"}</h2>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
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
    )
}

export default Profile