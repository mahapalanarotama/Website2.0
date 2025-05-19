import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBe-XLmVRiMs844VxR1_awMzGEGARb6Xmk",
  authDomain: "website-mpn-65e8d.firebaseapp.com",
  projectId: "website-mpn-65e8d",
  storageBucket: "website-mpn-65e8d.firebasestorage.app",
  messagingSenderId: "798271486726",
  appId: "1:798271486726:web:0d0e0178a963804f627c87",
  measurementId: "G-KSVPVC1Z9D"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// For debugging
console.log("Firebase initialized successfully");
const storage = getStorage(app);
let analytics: any = null;

// Initialize analytics only in browser environment
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, db, storage, analytics };