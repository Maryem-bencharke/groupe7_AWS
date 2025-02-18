import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import wordsData from "./words_clean.json" assert { type: "json" };


// 1️⃣ Configurer Firebase
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

// Fonction pour importer les mots
const importWords = async () => {
  for (const wordObj of wordsData.words) {
    const { word, id, length } = wordObj;
    
    try {
      // Ajouter chaque mot avec son propre nom comme ID
      await setDoc(doc(db, "words", word), {
        word,
        id,
        length
      });
      console.log(`Ajouté : ${word}`);
    } catch (error) {
      console.error(`Erreur avec ${word} :`, error);
    }
  }
};

importWords();