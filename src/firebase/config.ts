
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// nuevo
import { getAuth } from 'firebase/auth';
// fin nuevo

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDaVdKod7WU4WaxTNqVB0FCZLAV_R3w5Jc",
  authDomain: "astro-authentication-fecaf.firebaseapp.com",
  projectId: "astro-authentication-fecaf",
  storageBucket: "astro-authentication-fecaf.firebasestorage.app",
  messagingSenderId: "555216615936",
  appId: "1:555216615936:web:e9cc09af453f08b2ae76e5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);



// esto se coloca
const auth = getAuth(app);
auth.languageCode = 'es';

export const firebase = {
  app,
  auth,
};