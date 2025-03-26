import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBKbXwyGm8tf5neHTZqYW8AkvwqjpxUaGs",
    authDomain: "jeu-de-mots-9815d.firebaseapp.com",
    projectId: "jeu-de-mots-9815d",
    storageBucket: "jeu-de-mots-9815d.appspot.com",
    messagingSenderId: "650382206178",
    appId: "1:650382206178:web:3337e36531bf4c0f46eabb"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };