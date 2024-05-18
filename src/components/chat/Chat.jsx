import EmojiPicker from 'emoji-picker-react'
import './chat.css'
import { useEffect, useRef, useState } from 'react'
import { onSnapshot, doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';



function Chat() {
    const [chat, setChat] = useState()
    const [open, setOpen] = useState(false)
    const [text, setText] = useState("")
    const [img, setImg] = useState({
        file: null,
        url: "",
    })

    const { currentUser } = useUserStore()
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore()

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

    const handleImg = (e) => {
        if (e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }

    const handleSend = async () => {
        if (text === "") return;

        let imgUrl = null;

        try {

            if (img.file) {
                imgUrl = await upload(img.file)
            }

            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                    ...(imgUrl && { img: imgUrl }),
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

        setImg({
            file: null,
            url: "",
        })

        setText("")
    };


    return (
        <div className='chat'>
            <div className="top">
                <div className="user">
                    <img src={user?.avatar || "./avatar.png"} alt="avatar" />
                    <div className="texts">
                        <span>{user?.username}</span>
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
                {chat?.messages?.map((message) => (
                    <div className={`message ${message.senderId === currentUser.id ? 'own' : 'other'}`} key={message.createdAt}>
                        <div className="texts">
                            {message.img && <img src={message.img} alt="sendImage" />}
                            <p>{message.text}</p>
                            <span>1 minute ago</span>
                        </div>
                    </div>
                ))}
                {img.url &&
                    <div className="message own">
                        <div className="texts">
                            <img src={img.url} alt="sendImage" />
                        </div>
                    </div>
                }
                <div ref={endRef}></div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file">
                        <img src="./img.png" alt="img" />
                    </label>
                    <input type="file" id='file' style={{ display: "none" }} onChange={handleImg} />
                    <img src="./camera.png" alt="camera" />
                    <img src="./mic.png" alt="mic" />
                </div>
                <input type="text" placeholder={isCurrentUserBlocked || isReceiverBlocked ? "You cannot send a message!" : "Type a message..."} value={text} onChange={(e) => setText(e.target.value)} disabled={isCurrentUserBlocked || isReceiverBlocked} />
                <div className="emoji" onClick={() => setOpen((prev) => !prev)}>
                    <img src="./emoji.png" alt="emoji" />
                    <div className="picker">
                        <EmojiPicker onEmojiClick={handleEmoji} open={open} />
                    </div>
                </div>
                <button className='sendButton' onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>
            </div>
        </div>
    )
}

export default Chat