import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function createAdmin(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Admin account created successfully:", userCredential.user.email);
  } catch (error: any) {
    console.error("Error creating admin account:", error.message);
  } finally {
    process.exit();
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Please provide email and password as arguments");
  console.log("Usage: npm run create-admin your@email.com yourpassword");
  process.exit(1);
}

createAdmin(email, password);