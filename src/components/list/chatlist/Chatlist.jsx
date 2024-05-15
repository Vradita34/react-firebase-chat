import { useEffect, useState } from 'react'
import './chatlist.css'
import AddUser from './addUser/AddUser'
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

function Chatlist() {
    const [chats, setChats] = useState([])
    const [addMode, setAddMode] = useState(false)

    const { currentUser } = useUserStore()

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
            const data = res.data(); // Ambil objek data dari dokumen snapshot
            if (data) {
                const items = data.chats;

                const promises = items.map(async (item) => { // Gunakan map() untuk melakukan iterasi melalui setiap item
                    const userDocRef = doc(db, "users", item.receiverId); // Perhatikan penggunaan item.receiverId daripada items.receiverId
                    const userDocSnap = await getDoc(userDocRef);
                    const user = userDocSnap.data();
                    return { ...item, user };
                });
                const chatData = await Promise.all(promises);

                // Pastikan chatData tidak null sebelum sorting dan menetapkan state
                if (chatData) {
                    // Sort chats berdasarkan tanggal update (updateAt)
                    chatData.sort((a, b) => b.updateAt - a.updateAt);
                    setChats(chatData);
                }
            }
        });

        return () => {
            unSub();
        };
    }, [currentUser.id]);

    return (
        <div className='chatlist'>
            <div className="search">
                <div className="searchBar">
                    <img src="./search.png" alt="" />
                    <input type="text" placeholder='Search' />
                </div>
                <img src={addMode ? "./minus.png" : "./plus.png"} alt="" className='add'
                    onClick={() => setAddMode((prev) => !prev)} />
            </div>
            {chats.map((chat) => (
                <div className="items" key={chat.chatId}>
                    <img src={chat.user.avatar || "./avatar.png"} alt="user" />
                    <div className="texts">
                        <span>{chat.user.username}</span>
                        <p>{chat.lastMessage}</p>
                    </div>
                </div>
            ))}
            {addMode && <AddUser />}
        </div>
    )
}

export default Chatlist;
