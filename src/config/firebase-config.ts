import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

let firebaseConfig;

if (import.meta.env.FIREBASE_WEBAPP_CONFIG) {
  console.log("Using App Hosting provided FIREBASE_WEBAPP_CONFIG");
  firebaseConfig = JSON.parse(import.meta.env.FIREBASE_WEBAPP_CONFIG);
} else {
  console.log("Using local .env / import.meta.env for Firebase config");
  firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "inventory-tracker-7fbc1.firebaseapp.com",
    databaseURL: "https://inventory-tracker-7fbc1-default-rtdb.firebaseio.com",
    projectId: "inventory-tracker-7fbc1",
    storageBucket: "inventory-tracker-7fbc1.firebasestorage.app",
    messagingSenderId: "264767024897",
    appId: "1:264767024897:web:d0fc7182d82e4b4cf5f500",
    measurementId: "G-1G43SEK15L"
  };
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
