import EmojiPicker from 'emoji-picker-react';
import './chat.css';
import { useEffect, useRef, useState } from 'react';
import { onSnapshot, doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';
import { formatDistanceToNow } from 'date-fns';
import Detail from './detail/Detail';

function Chat() {
    const [chat, setChat] = useState();
    const [open, setOpen] = useState(false);
    const [addDetail, setAddDetail] = useState(false);
    const [text, setText] = useState("");
    const [img, setImg] = useState({
        file: null,
        url: "",
    });
    const [audioBlob, setAudioBlob] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editMessageId, setEditMessageId] = useState(null);
    const [showActions, setShowActions] = useState(false);
    const [clickedMessageId, setClickedMessageId] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);

    const { currentUser } = useUserStore();
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, deleteChat } = useChatStore();
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat?.messages]);

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            setChat(res.data());
        });

        return () => {
            unSub();
        };
    }, [chatId]);

    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji);
        setOpen(false);
    };

    const handleSend = async () => {
        const trimmedText = text.trim();
        if (trimmedText === "" && !img.file && !audioBlob) return;

        let imgUrl = null;
        let audioUrl = null;

        try {
            if (img.file) {
                imgUrl = await upload(img.file);
            }

            if (audioBlob) {
                const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
                audioUrl = await upload(audioFile);
            }

            if (editMode) {
                const updatedMessages = chat.messages.map(message =>
                    message.id === editMessageId ? { ...message, text: trimmedText, ...(imgUrl && { img: imgUrl }), ...(audioUrl && { audio: audioUrl }), updatedAt: new Date() } : message
                );

                await updateDoc(doc(db, "chats", chatId), {
                    messages: updatedMessages,
                });

                setEditMode(false);
                setEditMessageId(null);
            } else {
                await updateDoc(doc(db, "chats", chatId), {
                    messages: arrayUnion({
                        id: Date.now().toString(),
                        senderId: currentUser.id,
                        text: trimmedText,
                        createdAt: new Date(),
                        ...(imgUrl && { img: imgUrl }),
                        ...(audioUrl && { audio: audioUrl }),
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
                            userChatsData.chats[chatIndex].lastMessage = trimmedText;
                            userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
                            userChatsData.chats[chatIndex].updateAt = Date.now();

                            await updateDoc(userChatRef, {
                                chats: userChatsData.chats,
                            });
                        }
                    } else {
                        await setDoc(userChatRef, {
                            chats: [{
                                chatId: chatId,
                                lastMessage: trimmedText,
                                isSeen: id === currentUser.id ? true : false,
                                updateAt: Date.now(),
                            }]
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }

        setImg({
            file: null,
            url: "",
        });
        setAudioBlob(null);
        setText("");
    };

    const handleImg = (e) => {
        if (e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            });
        }
    };

    const handleEdit = (message) => {
        setEditMode(true);
        setEditMessageId(message.id);
        setText(message.text);
        setImg({ file: null, url: message.img || "" });
    };

    const handleDelete = async (messageId) => {
        const updatedMessages = chat.messages.filter(message => message.id !== messageId);
        await updateDoc(doc(db, "chats", chatId), {
            messages: updatedMessages,
        });
    };

    const handleBack = () => {
        deleteChat(null, null);
    };

    const handleToggleActions = (messageId) => {
        setClickedMessageId(messageId);
        setShowActions(prev => !prev);
    };

    const handleRecord = async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                const audioChunks = [];

                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    setAudioBlob(audioBlob);
                    stream.getTracks().forEach(track => track.stop());
                };

                setMediaRecorder(mediaRecorder);
                mediaRecorder.start();
                setIsRecording(true);
            } catch (error) {
                console.error("Microphone permission denied or error:", error);
            }
        } else {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className='chat'>
            <div className="top">
                <div className="user">
                    <img src="./back.png" alt="back" onClick={handleBack} />
                    <img src={user?.avatar || "./avatar.png"} alt="avatar" onClick={() => setAddDetail((prev) => !prev)} />
                    <div className="texts" onClick={() => setAddDetail((prev) => !prev)}>
                        <span>{user?.username}</span>
                        <p> Lorem ipsum dolor sit amet consectetur. </p>
                    </div>
                </div>
                <div className="icons">
                    {/* <img src="./phone.png" alt="phone" />
                    <img src="./video.png" alt="video" /> */}
                    <img src="./info.png" alt="info" onClick={() => setAddDetail((prev) => !prev)} />
                </div>
            </div>
            <div className="center">
                {chat?.messages?.map((message) => (
                    <div className={`message ${message.senderId === currentUser.id ? 'own' : 'other'}`} key={message.id} onClick={() => handleToggleActions(message.id)} >
                        <div className="texts">
                            {message.img && <img src={message.img} alt="sendImage" />}
                            {message.audio && <audio controls src={message.audio} />}
                            <p>{message.text}</p>
                            {message.senderId === currentUser.id && clickedMessageId === message.id && (
                                <div className="actions" style={{ display: showActions ? "block" : "none" }}>
                                    <button onClick={() => handleEdit(message)}>Edit</button>
                                    <button onClick={() => handleDelete(message.id)}>Delete</button>
                                </div>
                            )}
                            <span>{formatDistanceToNow(message.createdAt.toDate(), { addSuffix: true })}</span>
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
                    <img src="./mic.png" alt="mic" onClick={handleRecord} />
                </div>
                <input type="text" placeholder={isCurrentUserBlocked || isReceiverBlocked ? "You cannot send a message!" : "Type a message..."} value={text} onChange={(e) => setText(e.target.value)} disabled={isCurrentUserBlocked || isReceiverBlocked} />
                <div className="emoji" onClick={() => setOpen((prev) => !prev)}>
                    <img src="./emoji.png" alt="emoji" />
                    <div className="picker">
                        <EmojiPicker onEmojiClick={handleEmoji} open={open} />
                    </div>
                </div>
                <button className='sendButton' onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>{editMode ? 'Edit' : 'Send'}</button>
            </div>
            {addDetail && <Detail onClose={() => setAddDetail(false)} />}
        </div>
    );
}

export default Chat;
