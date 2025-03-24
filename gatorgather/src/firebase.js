
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products to use
// https://firebase.google.com/docs/web/setup#available-libraries

// GatorGather Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6Ojb6TdTSoxBlNMgcE-GH-jmUwLHi9YE",
  authDomain: "gatorgather.firebaseapp.com",
  projectId: "gatorgather",
  storageBucket: "gatorgather.firebasestorage.app",
  messagingSenderId: "1053491997856",
  appId: "1:1053491997856:web:9c990661f9ea05aeb06dc5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore
export const database = getFirestore(app);