import { useEffect, useState } from 'react';
import './chatlist.css';
import AddUser from './addUser/AddUser';
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../lib/chatStore';
import TextLimiter from './textLimiter/TextLimiter';
import useOnlineStatus from '../../../hooks/onlineStatus';  

function Chatlist() {
    const [chats, setChats] = useState([]);
    const [addMode, setAddMode] = useState(false);
    const [input, setInput] = useState('');

    const { currentUser } = useUserStore();
    const { chatId, changeChat } = useChatStore();

    useOnlineStatus();

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
            const data = res.data();
            if (data) {
                const items = data.chats || [];
                const promises = items.map(async (item) => {
                    const userDocRef = doc(db, "users", item.receiverId);
                    const userDocSnap = await getDoc(userDocRef);
                    const user = userDocSnap.data();
                    return { ...item, user };
                });

                const chatData = await Promise.all(promises);
                if (chatData) {
                    chatData.sort((a, b) => b.updateAt - a.updateAt);
                    setChats(chatData);
                }
            }
        });

        return () => {
            unSub();
        };
    }, [currentUser.id]);

    const handleSelect = async (chat) => {
        const updatedChats = chats.map((item) => {
            const { user, ...rest } = item;
            return rest;
        });

        const chatIndex = updatedChats.findIndex((item) => item.chatId === chat.chatId);
        if (chatIndex !== -1) {
            updatedChats[chatIndex].isSeen = true;
            const userChatRef = doc(db, "userchats", currentUser.id);
            try {
                await updateDoc(userChatRef, { chats: updatedChats });
                changeChat(chat.chatId, chat.user);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const filteredChats = chats.filter((c) => c.user?.username?.toLowerCase().includes(input.toLowerCase()));

    return (
        <div className='chatlist'>
            <div className="search">
                <div className="searchBar">
                    <img src="./search.png" alt="search" />
                    <input type="text" placeholder='Search' onChange={handleInputChange} />
                </div>
                <img src={addMode ? "./minus.png" : "./plus.png"} alt="add" className='add' onClick={() => setAddMode((prev) => !prev)} />
            </div>
            {filteredChats.map((chat) => (
                <div className="items" key={chat.chatId} onClick={() => handleSelect(chat)} style={{ backgroundColor: chat?.isSeen ? "transparent" : "#5183fe" }}>
                    <img src={chat.user?.blocked?.includes(currentUser.id) ? "./avatar.png" : chat.user?.avatar || "./avatar.png"} alt="user" />
                    <div className="texts">
                        <span>{chat.user?.blocked?.includes(currentUser.id) ? "user" : chat.user?.username}</span>
                        <TextLimiter text={chat.lastMessage} limit={50} />
                    </div>
                </div>
            ))}
            {addMode && <AddUser />}
        </div>
    );
}

export default Chatlist;
