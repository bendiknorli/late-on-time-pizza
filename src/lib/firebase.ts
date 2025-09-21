// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC_q8EZwN__V1nbUaXzV0mF6yCBX-q2ZX8",
    authDomain: "late-on-time-pizza.firebaseapp.com",
    databaseURL: "https://late-on-time-pizza-default-rtdb.firebaseio.com",
    projectId: "late-on-time-pizza",
    storageBucket: "late-on-time-pizza.firebasestorage.app",
    messagingSenderId: "1081723526024",
    appId: "1:1081723526024:web:28359351ace7e33520f83d",
    measurementId: "G-3HZ0R72QHE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);
const storage = getStorage(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export type FirebaseBundle = {
    app: ReturnType<typeof initializeApp>;
    auth: ReturnType<typeof getAuth>;
    db: ReturnType<typeof getFirestore>;
    realtimeDb: ReturnType<typeof getDatabase>;
    storage: ReturnType<typeof getStorage>;
    analytics: ReturnType<typeof getAnalytics>;
};

export function tryInitFirebase(): FirebaseBundle {
    return { app, auth, db, realtimeDb, storage, analytics };
}

export const authHelpers = {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    googleProvider,
    onAuthStateChanged,
    signOut,
};

// Export individual services for direct use
export { app, auth, db, realtimeDb, storage, analytics };
