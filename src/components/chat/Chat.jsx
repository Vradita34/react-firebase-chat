import React, { useEffect, useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import './chat.css';
import { onSnapshot, doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';
import { formatDistanceToNow } from 'date-fns';
import Detail from './detail/Detail';
import MediaModal from './modal/MediaModal';
import FilePreviewModal from './modal/FilePreviewModal';
import { deleteObject, ref } from 'firebase/storage';
import { linkify } from '../../lib/utils';

function Chat() {
    const [chat, setChat] = useState();
    const [open, setOpen] = useState(false);
    const [addDetail, setAddDetail] = useState(false);
    const [text, setText] = useState("");
    const [file, setFile] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editMessageId, setEditMessageId] = useState(null);
    const [showActions, setShowActions] = useState(false);
    const [clickedMessageId, setClickedMessageId] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isFilePreviewModalOpen, setIsFilePreviewModalOpen] = useState(false);
    const [previewFileType, setPreviewFileType] = useState(null);
    const [previewFileUrl, setPreviewFileUrl] = useState(null);

    const { currentUser } = useUserStore();
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, deleteChat } = useChatStore();
    const endRef = useRef(null);
    const [isFriendOnline, setIsFriendOnline] = useState(false);

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

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "users", user.id), (doc) => {
            if (doc.exists()) {
                const userData = doc.data();
                setIsFriendOnline(userData.isOnline);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [user.id]);

    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible') {
                await updateDoc(doc(db, "users", currentUser.id), {
                    isOnline: true,
                });
            } else {
                await updateDoc(doc(db, "users", currentUser.id), {
                    isOnline: false,
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Set online status when the component mounts
        const setOnline = async () => {
            await updateDoc(doc(db, "users", currentUser.id), {
                isOnline: true,
            });
        };

        setOnline();

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            // Set offline status when the component unmounts
            const setOffline = async () => {
                await updateDoc(doc(db, "users", currentUser.id), {
                    isOnline: false,
                });
            };

            setOffline();
        };
    }, [currentUser.id]);

    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji);
        setOpen(false);
    };

    const handleSend = async () => {
        const trimmedText = text.trim();
        if (trimmedText === "" && !file && !audioBlob) return;

        let fileUrl = null;
        let audioUrl = null;

        try {
            if (file) {
                fileUrl = await upload(file, (progress) => setUploadProgress(progress));
            }

            if (audioBlob) {
                const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
                audioUrl = await upload(audioFile);
            }

            if (editMode) {
                const updatedMessages = chat.messages.map(message =>
                    message.id === editMessageId ? {
                        ...message,
                        text: trimmedText,
                        ...(fileUrl && { file: fileUrl, fileType }),
                        ...(audioUrl && { audio: audioUrl }),
                        updatedAt: new Date(),
                        edited: true
                    } : message
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
                        ...(fileUrl && { file: fileUrl, fileType }),
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

        setFile(null);
        setFileType(null);
        setFilePreview(null);
        setAudioBlob(null);
        setText("");
    };

    const handleFileSelect = (selectedFile, type) => {
        setFile(selectedFile);
        setFileType(type);
        setFilePreview(URL.createObjectURL(selectedFile));
    };

    const handleEdit = (message) => {
        if (message.text === "pesan telah dihapus") return;

        setEditMode(true);
        setEditMessageId(message.id);
        setText(message.text);
        setFile(null);
        setFileType(null);
        setFilePreview(message.file || "");
    };

    const handleDelete = async (messageId) => {
        const messageToDelete = chat.messages.find(message => message.id === messageId);

        if (!messageToDelete) {
            console.error("Message not found");
            return;
        }

        if (messageToDelete.file) {
            try {
                const fileRef = ref(storage, messageToDelete.file);
                await deleteObject(fileRef);
                console.log("File deleted successfully from Storage");
            } catch (error) {
                console.error("Error deleting file from Storage:", error);
            }
        }

        const updatedMessages = chat.messages.map(message =>
            message.id === messageId
                ? { ...message, text: "pesan telah dihapus", file: null, fileType: null }
                : message
        );

        try {
            await updateDoc(doc(db, "chats", chatId), {
                messages: updatedMessages,
            });
            console.log("Message updated to 'pesan telah dihapus' in Firestore");
        } catch (error) {
            console.error("Error updating message in Firestore:", error);
        }
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

    const handleCancelUpload = () => {
        setFile(null);
        setFileType(null);
        setFilePreview(null);
        setUploadProgress(0);
    };

    const handlePreview = (fileType, fileUrl) => {
        setPreviewFileType(fileType);
        setPreviewFileUrl(fileUrl);
        setIsFilePreviewModalOpen(true);
    };

    const handleTextChange = (e) => {
        setText(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    return (
        <div className='chat'>
            <div className="top">
                <div className="user">
                    {/* <img src="./back.png" alt="back" onClick={handleBack} /> */}
                    <button onClick={handleBack} className="button">
                        <div className="button-box">
                            <span className="button-elem">
                                <svg viewBox="0 0 46 40" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M46 20.038c0-.7-.3-1.5-.8-2.1l-16-17c-1.1-1-3.2-1.4-4.4-.3-1.2 1.1-1.2 3.3 0 4.4l11.3 11.9H3c-1.7 0-3 1.3-3 3s1.3 3 3 3h33.1l-11.3 11.9c-1 1-1.2 3.3 0 4.4 1.2 1.1 3.3.8 4.4-.3l16-17c.5-.5.8-1.1.8-1.9z"
                                    ></path>
                                </svg>
                            </span>
                            <span className="button-elem">
                                <svg viewBox="0 0 46 40">
                                    <path
                                        d="M46 20.038c0-.7-.3-1.5-.8-2.1l-16-17c-1.1-1-3.2-1.4-4.4-.3-1.2 1.1-1.2 3.3 0 4.4l11.3 11.9H3c-1.7 0-3 1.3-3 3s1.3 3 3 3h33.1l-11.3 11.9c-1 1-1.2 3.3 0 4.4 1.2 1.1 3.3.8 4.4-.3l16-17c.5-.5.8-1.1.8-1.9z"
                                    ></path>
                                </svg>
                            </span>
                        </div>
                    </button>

                    <img src={user?.avatar || "./avatar.png"} alt="avatar" onClick={() => setAddDetail((prev) => !prev)} />
                    <div className="texts" onClick={() => setAddDetail((prev) => !prev)}>
                        <span>{user?.username}</span>
                        <p> {user?.info} </p>
                        {isFriendOnline ? (
                            <small className='onlineCuy'>Sedang Online</small>
                        ) : (
                            <small className='offline'>Sedang Offline</small>
                        )}
                    </div>
                </div>
                <div className="icons">
                    <img src="./info.png" alt="info" onClick={() => setAddDetail((prev) => !prev)} />
                </div>
            </div>
            <div className="center">
                {chat?.messages?.map((message) => (
                    <div className={`message ${message.senderId === currentUser.id ? 'own' : 'other'}`} key={message.id} onClick={() => handleToggleActions(message.id)} >
                        <div className="texts">
                            {message.fileType === 'video' && (
                                <>
                                    <video controls src={message.file} />
                                    <button onClick={() => handlePreview('video', message.file)}>Fullscreen</button>
                                </>
                            )}
                            {message.fileType === 'audio' && <audio controls src={message.file} />}
                            {message.fileType === 'image' && (
                                <>
                                    <img src={message.file} alt="sendImage" />
                                    <button onClick={() => handlePreview('image', message.file)}>Fullscreen</button>
                                </>
                            )}
                            {message.fileType === 'document' && <a href={message.file} target="_blank" rel="noopener noreferrer">Open Document</a>}
                            {/* <p>{message.text}</p> */}
                            <p dangerouslySetInnerHTML={{ __html: linkify(message.text) }}></p>
                            {message.edited && <small style={{ fontSize: "10px", color: "#888" }}> (Pesan telah diedit) </small>}
                            {message.senderId === currentUser.id && clickedMessageId === message.id && message.text !== "pesan telah dihapus" && (
                                <div className="actions" style={{ display: showActions ? "block" : "none" }}>
                                    <button onClick={() => handleEdit(message)}>Edit</button>
                                    <button onClick={() => handleDelete(message.id)}>Delete</button>
                                </div>
                            )}
                            <span>{formatDistanceToNow(message.createdAt.toDate(), { addSuffix: true })}</span>
                        </div>
                    </div>
                ))}
                {filePreview &&
                    <div className="message own">
                        <div className="texts">
                            {fileType === 'video' && <video controls src={filePreview} />}
                            {fileType === 'audio' && <audio controls src={filePreview} />}
                            {fileType === 'document' && <a href={filePreview} target="_blank" rel="noopener noreferrer">Open Document</a>}
                            {fileType === 'image' && <img src={filePreview} alt="sendImage" />}
                            {uploadProgress > 0 && <progress value={uploadProgress} max="100" />}
                            <button onClick={handleCancelUpload}>Cancel Upload</button>
                        </div>
                    </div>
                }
                <div ref={endRef}></div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <input type="file" id='file' style={{ display: "none" }} />
                    <img src="./link.png" alt="link" onClick={() => setIsFileUploadModalOpen(true)} />
                    <img src="./mic.png" alt="mic" onClick={handleRecord} />
                </div>
                <textarea
                    placeholder={isCurrentUserBlocked || isReceiverBlocked ? "You cannot send a message!" : "Type a message..."}
                    value={text}
                    onChange={handleTextChange}
                    disabled={isCurrentUserBlocked || isReceiverBlocked}
                    className="message-textarea"
                ></textarea>
                <div className="emoji" onClick={() => setOpen((prev) => !prev)}>
                    <img src="./emoji.png" alt="emoji" />
                    <div className="picker">
                        <EmojiPicker onEmojiClick={handleEmoji} open={open} />
                    </div>
                </div>
                <button className='tombol' onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>
                    <div className="svg-wrapper-1">
                        <div className="svg-wrapper">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="none" d="M0 0h24v24H0z"></path>
                                <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"></path>
                            </svg>
                        </div>
                    </div>
                    <span>{editMode ? 'Edit' : 'Send'}</span>
                </button>
            </div>
            {addDetail && <Detail onClose={() => setAddDetail(false)} />}
            {isFileUploadModalOpen && <MediaModal onClose={() => setIsFileUploadModalOpen(false)} onFileSelect={handleFileSelect} />}
            {isFilePreviewModalOpen && <FilePreviewModal fileType={previewFileType} fileUrl={previewFileUrl} onClose={() => setIsFilePreviewModalOpen(false)} />}
        </div>
    );
}

export default Chat;
