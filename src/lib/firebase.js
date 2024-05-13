
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: "reactchat-f4f60.firebaseapp.com",
    projectId: "reactchat-f4f60",
    storageBucket: "reactchat-f4f60.appspot.com",
    messagingSenderId: "1056227486079",
    appId: "1:1056227486079:web:0ab1b2a1bbce243ad4524a"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()
