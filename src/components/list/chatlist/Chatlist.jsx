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
            const items = res.data().chats;

            const promises = items.data(async (item) => {
                const userDocRef = doc(db, "users", items.receiverId);
                const userDocSnap = await getDoc(userDocRef);

                const user = userDocSnap.data()

                return { ...item, user }
            });

            const chatData = await Promise.all(promises)

            setChats(chatData.sort((a, b) => b.updateAt - a.updateAt));
        });

        return () => {
            unSub()
        }
    }, [currentUser.id])


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
                    <img src="./avatar.png" alt="user" />
                    <div className="texts">
                        <span>Vradita</span>
                        <p>{chat.lastMessage}</p>
                    </div>
                </div>
            ))}
            {addMode && <AddUser />}
        </div>
    )
}

export default Chatlist