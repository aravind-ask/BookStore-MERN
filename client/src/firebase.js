// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "rebook-mern.firebaseapp.com",
  projectId: "rebook-mern",
  storageBucket: "rebook-mern.appspot.com",
  messagingSenderId: "456402676668",
  appId: "1:456402676668:web:36bf6ee980a8f7b5a799b9",
  measurementId: "G-1SYE2EKM5J",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
