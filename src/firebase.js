import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAemNiOsk0-GRkhJPXQfTVzKdIhCvabmtM",
  authDomain: "studyhub-d6422.firebaseapp.com",
  projectId: "studyhub-d6422",
  storageBucket: "studyhub-d6422.firebasestorage.app",
  messagingSenderId: "1018023321139",
  appId: "1:1018023321139:web:06165a45635b6f6ef6cd46"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
