import { readFile } from 'fs/promises';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Configuration Firebase (remplace par la tienne)
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

// Lire le fichier JSON manuellement
const loadWords = async () => {
  try {
    const data = await readFile('./words_clean.json', 'utf-8');
    return JSON.parse(data).words;
  } catch (error) {
    console.error("Erreur lors de la lecture du fichier JSON :", error);
    return [];
  }
};

// Importer les mots dans Firebase
const importWords = async () => {
    const wordsData = await loadWords();
    console.log("Données chargées :", wordsData); // Vérification
  
    for (const wordObj of wordsData) {
      if (!wordObj.mot || !wordObj.ID || !wordObj.length) {
        console.error("Donnée invalide :", wordObj);
        continue; // Passe au suivant si l'objet est incomplet
      }
  
      const { mot: word, ID: id, length } = wordObj;
      console.log(`Ajout du mot : ${word}`);
  
      try {
        await setDoc(doc(db, "words", id.toString()), { word, id, length });
        console.log(`Ajouté : ${word}`);
      } catch (error) {
        console.error(`Erreur avec ${word} :`, error);
      }
    }
  };
  

importWords();
