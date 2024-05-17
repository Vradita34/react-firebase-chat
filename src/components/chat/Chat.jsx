import EmojiPicker from 'emoji-picker-react'
import './chat.css'
import { useEffect, useRef, useState } from 'react'
import { onSnapshot, doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';



function Chat() {
    const [chat, setChat] = useState()
    const [open, setOpen] = useState(false)
    const [text, setText] = useState("")

    const { currentUser } = useUserStore()
    const { chatId, user } = useChatStore()

    const endRef = useRef(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" })
    }, []);

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            setChat(res.data())
        })

        return () => {
            unSub()
        }
    }, [chatId])


    const handleEmoji = (e) => {
        setText(prev => prev + e.emoji);
        setOpen(false)
    }
    console.log(chat)

    // const handleSend = async () => {
    //     if (text === "") return;

    //     try {
    //         await updateDoc(doc(db, "chats", chatId), {
    //             messages: arrayUnion({
    //                 senderId: currentUser.id,
    //                 text,
    //                 createdAt: new Date(),
    //             })
    //         })

    //         const userIDs = [currentUser.id, user.id]

    //         userIDs.forEach(async (id) => {
    //             const userChatRef = doc(db, "userchats", id)
    //             const userChatsSnapshot = await getDoc(userChatRef)

    //             if (userChatsSnapshot.exists()) {
    //                 const userChatsData = userChatsSnapshot.data()

    //                 const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId)

    //                 userChatsData[chatIndex].lastMessage = text;
    //                 userChatsData[chatIndex].isSeen = id === currentUser.id ? true : false;
    //                 userChatsData[chatIndex].updateAt = Date.now();

    //                 await updateDoc(userChatRef, {
    //                     chats: userChatsData.chats,
    //                 })
    //             }
    //         })

    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

    const handleSend = async () => {
        if (text === "") return;

        try {
            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                })
            });

            const userIDs = [currentUser.id, user.id];

            for (const id of userIDs) {
                const userChatRef = doc(db, "userchats", id);
                const userChatsSnapshot = await getDoc(userChatRef);

                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();
                    const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);

                    if (chatIndex !== -1) {
                        userChatsData.chats[chatIndex].lastMessage = text;
                        userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
                        userChatsData.chats[chatIndex].updateAt = Date.now();

                        await updateDoc(userChatRef, {
                            chats: userChatsData.chats,
                        });
                    }
                } else {
                    // Jika dokumen userChats tidak ada, buat dokumen baru
                    await setDoc(userChatRef, {
                        chats: [{
                            chatId: chatId,
                            lastMessage: text,
                            isSeen: id === currentUser.id ? true : false,
                            updateAt: Date.now(),
                        }]
                    });
                }
            }
        } catch (error) {
            console.log(error);
        }
    };


    return (
        <div className='chat'>
            <div className="top">
                <div className="user">
                    <img src="./avatar.png" alt="user" />
                    <div className="texts">
                        <span>Sepuh Azka</span>
                        <p> Lorem ipsum dolor sit amet consectetur. </p>
                    </div>
                </div>
                <div className="icons">
                    <img src="./phone.png" alt="phone" />
                    <img src="./video.png" alt="video" />
                    <img src="./info.png" alt="info" />
                </div>
            </div>
            <div className="center">
                {/* <div className="message">
                    <img src="./avatar.png" alt="avatar" />
                    <div className="texts">
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit nobis consectetur sequi quasi velit eius, nemo commodi ad! Quaerat deserunt assumenda ratione voluptatibus autem at aut blanditiis, eum repellendus sint?</p>
                        <span>1 minutes ago</span>
                    </div>
                </div> */}
                {chat?.messages?.map((message) => (
                    <div className={`message ${message.senderId === currentUser.id ? 'own' : 'other'}`} key={message.createdAt}>
                        <div className="texts">
                            {message.img && <img src={message.img} alt="sendImage" />}
                            <p>{message.text}</p>
                            <span>1 minute ago</span>
                        </div>
                    </div>
                ))}
                <div ref={endRef}></div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <img src="./img.png" alt="img" />
                    <img src="./camera.png" alt="camera" />
                    <img src="./mic.png" alt="mic" />
                </div>
                <input type="text" placeholder='Type a message...' value={text} onChange={(e) => setText(e.target.value)} />
                <div className="emoji" onClick={() => setOpen((prev) => !prev)}>
                    <img src="./emoji.png" alt="emoji" />
                    <div className="picker">
                        <EmojiPicker onEmojiClick={handleEmoji} open={open} />
                    </div>
                </div>
                <button className='sendButton' onClick={handleSend}>Send</button>
            </div>
        </div>
    )
}

export default Chat