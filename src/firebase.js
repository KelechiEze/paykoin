// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ✅ Import Storage

const firebaseConfig = {
  apiKey: "AIzaSyBqBYkKD2DQkGgVFPNCv4X74EC5owAtpoQ",
  authDomain: "tutorial-ef3fb.firebaseapp.com",
  projectId: "tutorial-ef3fb",
  storageBucket: "tutorial-ef3fb.appspot.com",
  messagingSenderId: "1025165442291",
  appId: "1:1025165442291:web:ea2a5b7acc24878c054b86",
  measurementId: "G-C4C89LMS9V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // ✅ Initialize storage

// Export all
export { auth, db, storage };
