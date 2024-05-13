
import { toast } from 'react-toastify';
import { auth } from '../../lib/firebase'
import './detail.css'

function Detail() {

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
            <div className="user">
                <img src="./avatar.png" alt="avatar" />
                <h2>Sepuh Azka</h2>
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
                </div>
                <div className="option">
                    <div className="title">
                        <span>Shared Files</span>
                        <img src="./arrowUp.png" alt="arrowUp" />
                    </div>
                </div>
                <button>Block User</button>
                <button className='logout' onClick={handleLogout}>Log Out</button>
            </div>
        </div>
    )
}

export default Detail