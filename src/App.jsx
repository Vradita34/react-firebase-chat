import React, { useEffect, useState } from "react";
import Chat from "./components/chat/Chat";
import List from "./components/list/List";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import LandingPage from "./components/landingpage/LandingPage";
import Loading from "./components/loading/Loading";
import { ref, onValue, set } from "firebase/database"; // Import necessary functions

const App = () => {
  const { currentUser, isLoading, fetchUserInfo, setLoading } = useUserStore();
  const { chatId } = useChatStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserInfo(user?.uid);
        // Update user's online status in the database
        const userStatusRef = ref(db, `/status/${user.uid}`);
        set(userStatusRef, { online: true });

        // Listen for changes to the user's status
        onValue(userStatusRef, (snapshot) => {
          if (snapshot.val().online) {
            setIsOnline(true);
            setNotification("Your friend is online!");
          } else {
            setIsOnline(false);
            setNotification("Your friend is offline.");
          }
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo, setLoading]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNotification("You are back online!");
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNotification("You are currently offline.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isLoading) return <Loading />;

  return (
    <div className='container area'>
      <ul className="circles">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
      {notification && <div className={isOnline ? "notification online" : "notification offline"}>{notification}</div>}
      {currentUser ? (
        <>
          {!chatId && <List />}
          {chatId && <Chat />}
        </>
      ) : (
        <LandingPage />
      )}
      <Notification />
    </div>
  );
};

export default App;
