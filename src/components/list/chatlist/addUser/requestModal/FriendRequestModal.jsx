import React, { useEffect, useState } from 'react';
import './friendRequestModal.css';
import { collection, doc, onSnapshot, updateDoc, arrayRemove, arrayUnion, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../lib/firebase';
import { useUserStore } from '../../../../../lib/userStore';
import { toast } from 'react-toastify';

const FriendRequestModal = ({ onClose }) => {
    const { currentUser } = useUserStore();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState({});

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "friendRequests", currentUser.id), (doc) => {
            if (doc.exists()) {
                setRequests(doc.data().requests || []);
            }
        });

        return () => unsub();
    }, [currentUser.id]);

    const handleAccept = async (request) => {
        setLoading(prev => ({ ...prev, [request.senderId]: true }));
        const chatRef = collection(db, "chats");
        const userChatRef = collection(db, "userchats");

        try {
            const newChatRef = doc(chatRef);

            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: []
            });

            // Perbarui userChat untuk currentUser
            const currentUserChatDoc = doc(userChatRef, currentUser.id);
            const currentUserChatSnapshot = await getDoc(currentUserChatDoc);
            if (!currentUserChatSnapshot.exists()) {
                await setDoc(currentUserChatDoc, { chats: [] });
            }

            await updateDoc(currentUserChatDoc, {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: request.senderId,
                    updateAt: Date.now(),
                })
            });

            // Perbarui userChat untuk pengirim permintaan
            const senderChatDoc = doc(userChatRef, request.senderId);
            const senderChatSnapshot = await getDoc(senderChatDoc);
            if (!senderChatSnapshot.exists()) {
                await setDoc(senderChatDoc, { chats: [] });
            }

            await updateDoc(senderChatDoc, {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: currentUser.id,
                    updateAt: Date.now(),
                })
            });

            // Hapus permintaan pertemanan setelah diterima
            await updateDoc(doc(db, "friendRequests", currentUser.id), {
                requests: arrayRemove(request)
            });

            console.log("Friend request accepted");
            toast.success("Friend request accepted")
        } catch (error) {
            console.error("Error accepting friend request:", error);
            toast.error("Error accepting friend request:", error)
        } finally {
            setLoading(prev => ({ ...prev, [request.senderId]: false }));
        }
    };

    const handleDecline = async (request) => {
        setLoading(prev => ({ ...prev, [request.senderId]: true }));
        try {
            await updateDoc(doc(db, "friendRequests", currentUser.id), {
                requests: arrayRemove(request)
            });

            const senderFriendRequestDoc = doc(db, "friendRequests", request.senderId);
            const senderFriendRequestSnapshot = await getDoc(senderFriendRequestDoc);
            if (!senderFriendRequestSnapshot.exists()) {
                await setDoc(senderFriendRequestDoc, { notifications: [] });
            }

            await updateDoc(senderFriendRequestDoc, {
                notifications: arrayUnion({
                    message: `${currentUser.username} declined your friend request`,
                    createdAt: serverTimestamp(),
                })
            });

            console.log("Friend request declined");
            toast.warning("Friend request declined")
        } catch (error) {
            console.error("Error declining friend request:", error);
            toast.error("Error declining friend request:", error)
        } finally {
            setLoading(prev => ({ ...prev, [request.senderId]: false }));
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Friend Requests</h2>
                <div className="requests">
                    {requests.length === 0 ? (
                        <p>No friend requests</p>
                    ) : (
                        requests.map((request, index) => (
                            <div key={index} className="request">
                                <img src={request.senderAvatar || "./avatar.png"} alt="avatar" />
                                <div className="request-info">
                                    <p>{request.senderName}</p>
                                    <div className="actions">
                                        <button
                                            onClick={() => handleAccept(request)}
                                            disabled={loading[request.senderId]}
                                        >
                                            {loading[request.senderId] ? "Accepting..." : "Accept"}
                                        </button>
                                        <button
                                            onClick={() => handleDecline(request)}
                                            disabled={loading[request.senderId]}
                                        >
                                            {loading[request.senderId] ? "Declining..." : "Decline"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendRequestModal;
