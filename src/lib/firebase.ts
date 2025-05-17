
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4aeOCUM8VAfA6cR80BmVu_wsvPNj2Mg4",
  authDomain: "pbl-1-eb599.firebaseapp.com",
  projectId: "pbl-1-eb599",
  storageBucket: "pbl-1-eb599.firebasestorage.app",
  messagingSenderId: "371863499573",
  appId: "1:371863499573:web:e83093bd04f4f79677d27c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
