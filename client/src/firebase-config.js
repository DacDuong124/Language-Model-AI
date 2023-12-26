// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD41gPBqyZpRdKGkvF8vt5NCS-X7nrPZ5c",
  authDomain: "language-ai-model.firebaseapp.com",
  projectId: "language-ai-model",
  storageBucket: "language-ai-model.appspot.com",
  messagingSenderId: "151072582553",
  appId: "1:151072582553:web:3a9675413268fdf4024108",
  measurementId: "G-6JG9QW6P3P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export const auth = getAuth(app);
export { db };
