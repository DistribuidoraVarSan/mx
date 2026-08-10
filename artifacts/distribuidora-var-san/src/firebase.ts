import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
apiKey: "AIzaSyATf3RVsdICF5fofg5r7sQiFodywn2O3sQ",
authDomain: "distribuidora-var-san.firebaseapp.com",
projectId: "distribuidora-var-san",
storageBucket: "distribuidora-var-san.firebasestorage.app",
messagingSenderId: "413139004866",
appId: "1:413139004866:web:8d4ef20982bdfd278dfa5b",
measurementId: "G-KEQXE5DMCP",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
