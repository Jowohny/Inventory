import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "inventory-tracker-7fbc1.firebaseapp.com",
  databaseURL: "https://inventory-tracker-7fbc1-default-rtdb.firebaseio.com",
  projectId: "inventory-tracker-7fbc1",
  storageBucket: "inventory-tracker-7fbc1.firebasestorage.app",
  messagingSenderId: "264767024897",
  appId: "1:264767024897:web:d0fc7182d82e4b4cf5f500",
  measurementId: "G-1G43SEK15L"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)