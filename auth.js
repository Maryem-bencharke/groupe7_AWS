// import { auth } from "./firebase-config.js";
// import { 
//     createUserWithEmailAndPassword, 
//     signInWithEmailAndPassword,
//     signOut
// } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
// import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
// import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

// const db = getFirestore();
// const socket = io('https://groupe7-aws.onrender.com'); 
import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

const db = getFirestore();
const socket = io("https://groupe7-aws.onrender.com"); 

document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      let username = document.getElementById("username").value;
      let email = document.getElementById("email").value;
      let password = document.getElementById("password").value;

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          username,
          email,
          createdAt: new Date()
        });

        alert("Compte créé !");
        window.location.href = "login.html";
      } catch (error) {
        alert("Erreur : " + error.message);
      }
    });
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      let email = document.getElementById("login-email").value;
      let password = document.getElementById("login-password").value;

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        const username = userDoc.exists() ? userDoc.data().username : `Guest${Math.floor(Math.random() * 10000)}`;

        // ENVOI DU PSEUDO VERS LE SERVEUR
        socket.emit("setUsername", username);

        alert("Connexion réussie !");
        window.location.href = "games.html";
      } catch (error) {
        alert("Erreur : " + error.message);
      }
    });
  }

  // Gère aussi le cas de l'invité
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const username = userDoc.exists() ? userDoc.data().username : `Guest${Math.floor(Math.random() * 10000)}`;
      socket.emit("setUsername", username);
    } else {
      socket.emit("setUsername", `Guest${Math.floor(Math.random() * 10000)}`);
    }
  });
});

// Fonction pour déconnecter l'utilisateur
function logoutUser() {
    signOut(auth).then(() => {
        alert("Vous êtes maintenant déconnecté !");
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Erreur lors de la déconnexion :", error);
        alert("Erreur lors de la déconnexion : " + error.message);
    });
}

// Rendre la fonction logoutUser accessible globalement
window.logoutUser = logoutUser;

// // Gestion des formulaires d'inscription et connexion
// document.addEventListener("DOMContentLoaded", function() {
//     const signupForm = document.getElementById("signup-form");
//     if (signupForm) {
//         signupForm.addEventListener("submit", async function(event) {
//             event.preventDefault();

//             let username = document.getElementById("username").value;
//             let email = document.getElementById("email").value;
//             let password = document.getElementById("password").value;

//             try {
//                 const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//                 const user = userCredential.user;

//                 await setDoc(doc(db, "users", user.uid), {
//                     username: username,
//                     email: email,
//                     createdAt: new Date()
//                 });

//                 alert("Compte créé avec succès !");
//                 window.location.href = "login.html";
//             } catch (error) {
//                 console.error("Erreur d'inscription :", error);
//                 alert("Erreur : " + error.message);
//             }
//         });
//     }

//     const loginForm = document.getElementById("login-form");
//     if (loginForm) {
//         loginForm.addEventListener("submit", async function(event) {
//             event.preventDefault();

//             let email = document.getElementById("login-email").value;
//             let password = document.getElementById("login-password").value;

//             try {
//                 const userCredential = await signInWithEmailAndPassword(auth, email, password);
//                 const user = userCredential.user;

//                 // 🔥 Récupération précise du username depuis Firestore
//                 const userDoc = await getDoc(doc(db, "users", user.uid));
//                 let username;
//                 if (userDoc.exists()) {
//                     username = userDoc.data().username;
//                 } else {
//                     username = `Guest${Math.floor(Math.random() * 10000)}`;
//                 }

//                 socket.emit('setUsername', username);  // 🚨 envoie clairement une seule fois

//                 alert("Connexion réussie !");
//                 window.location.href = "games.html";
//             } catch (error) {
//                 console.error("Erreur de connexion :", error);
//                 alert("Erreur : " + error.message);
//             }
//         });
//     }

//     onAuthStateChanged(auth, (user) => {
//         if (!user) {
//             // 🚨 seulement si déconnecté, car connecté est déjà géré précisément ailleurs
//             socket.emit('setUsername', `Guest${Math.floor(Math.random() * 10000)}`);
//         }
//     });
// });

