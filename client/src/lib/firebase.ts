import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
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
const firebaseApp = initializeApp(firebaseConfig);

// Initialize auth with local persistence to handle third-party cookie restrictions
const auth = getAuth(firebaseApp);
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.warn('Auth persistence configuration failed:', error);
  });

const firestore = getFirestore(firebaseApp);

let analytics: any = null;

// Initialize analytics only if consent is given
if (typeof window !== 'undefined') {
  try {
    const hasConsent = localStorage.getItem('cookieConsent') === 'true';
    if (hasConsent) {
      analytics = getAnalytics(firebaseApp);
    }
  } catch (error) {
    console.warn('Analytics disabled due to cookie/storage restrictions:', error);
  }
}

// For debugging
console.log("Firebase initialized successfully");

export { firebaseApp as app, auth, firestore as db, analytics };
