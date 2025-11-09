import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "inventory-tracker-66904.firebaseapp.com",
  projectId: "inventory-tracker-66904",
  storageBucket: "inventory-tracker-66904.firebasestorage.app",
  messagingSenderId: "652509205959",
  appId: "1:652509205959:web:b00f559fe024ad6b4135e2",
  measurementId: "G-4E8WDWT13F"
};

const app = initializeApp(firebaseConfig);
