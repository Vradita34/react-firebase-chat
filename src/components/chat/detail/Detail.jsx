
import { toast } from 'react-toastify';
import { auth, db } from '../../../lib/firebase'
import './detail.css'
import { useChatStore } from '../../../lib/chatStore';
import { useUserStore } from '../../../lib/userStore';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';

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
        <div className='detail'>
            <div className="modal">
                <div className="modal-content">
                    <div className="modal-header">
                        <img src="./closered.png" alt="close" onClick={onClose} />
                    </div>
                    <div className="user">
                        <img src={user?.avatar || "./avatar.png"} alt="avatar" />
                        <h2>{user?.username || "anonim"}</h2>
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
                        {/* <div className="option">
                            <div className="title">
                                <span>Shared Photos</span>
                                <img src="./arrowDown.png" alt="arrowDown" />
                            </div>
                            <div className="photos">
                                <div className="photoItem">
                                    <div className="photoDetail">
                                        <img src="https://images.pexels.com/photos/1123972/pexels-photo-1123972.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="photosItem" />
                                        <span>Arial  Photograpy of cars on the road</span>
                                    </div>
                                    <img src="./download.png" alt="Donwload" className='iconDonwload' />
                                </div>
                                <div className="photoItem">
                                    <div className="photoDetail">
                                        <img src="https://images.pexels.com/photos/1123972/pexels-photo-1123972.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="photosItem" />
                                        <span>Arial  Photograpy of cars on the road</span>
                                    </div>
                                    <img src="./download.png" alt="Donwload" className='iconDonwload' />
                                </div>
                                <div className="photoItem">
                                    <div className="photoDetail">
                                        <img src="https://images.pexels.com/photos/1123972/pexels-photo-1123972.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="photosItem" />
                                        <span>Arial  Photograpy of cars on the road</span>
                                    </div>
                                    <img src="./download.png" alt="Donwload" className='iconDonwload' />
                                </div>
                            </div>
                        </div> */}
                        <div className="option">
                            <div className="title">
                                <span>Shared Files</span>
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