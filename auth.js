import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  fetchSignInMethodsForEmail
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

const db = getFirestore();
const socket = io("https://groupe7-aws.onrender.com"); 

let failedAttempts = 0;
let inactivityTimeout;


async function checkEmailExists(email) {
  try {
      // Cette méthode est disponible dans Firebase v9+
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0;
  } catch (error) {
      // En cas d'erreur, on considère que l'email n'existe pas
      return false;
  }
}

function setupPasswordToggle() {
  document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
      // Trouve l'input password associé à ce bouton
      const container = this.closest('.password-container');
      const input = container ? container.querySelector('input') : null;
      
      if (input) {
        // Alterne entre type password/text
        input.type = input.type === 'password' ? 'text' : 'password';
        // Change l'icône
        this.textContent = input.type === 'password' ? '👁️' : '🙈';
        // Garde le focus sur l'input
        input.focus();
      }
    });
  });
}

function setupPasswordValidation() {
  const passwordInput = document.getElementById('password');
  
  // Validation pour la page d'inscription seulement
  if (passwordInput) {
    const requirements = {
        length: document.getElementById('req-length'),
        lower: document.getElementById('req-lower'),
        upper: document.getElementById('req-upper'),
        number: document.getElementById('req-number'),
        special: document.getElementById('req-special')
    };

    if (Object.values(requirements).every(el => el !== null)) {
      passwordInput.addEventListener('input', function() {
          const value = this.value;
          const hasMinLength = value.length >= 8;
          const hasLower = /[a-z]/.test(value);
          const hasUpper = /[A-Z]/.test(value);
          const hasNumber = /\d/.test(value);
          const hasSpecial = /[\W_]/.test(value);
          
          toggleClass(requirements.length, hasMinLength);
          toggleClass(requirements.lower, hasLower);
          toggleClass(requirements.upper, hasUpper);
          toggleClass(requirements.number, hasNumber);
          toggleClass(requirements.special, hasSpecial);
      });
    }
  }
}

function toggleClass(element, isValid) {
  if (element) {  // Vérifie si l'élément existe
      if (isValid) {
          element.classList.add('valid');
      } else {
          element.classList.remove('valid');
      }
  }
}

function resetInactivityTimer() {
  clearTimeout(inactivityTimeout);
  inactivityTimeout = setTimeout(() => {
    signOut(auth).then(() => {
      alert("Vous avez été déconnecté pour inactivité.");
      window.location.href = "index.html";
    });
  }, 30 * 60 * 1000); // 30 min
}

document.addEventListener("mousemove", resetInactivityTimer);
document.addEventListener("keydown", resetInactivityTimer);
resetInactivityTimer(); // initial

document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signup-form");
  setupPasswordToggle();
  setupPasswordValidation();
  if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      let username = document.getElementById("username").value;
      let email = document.getElementById("email").value;
      let password = document.getElementById("password").value;
      try {
            // Validation du nom d'utilisateur 
          const isValidUsername = (username) => {
          const regex = /^[a-zA-Z0-9]+$/;
          return regex.test(username);
           };

        if (!isValidUsername(username)) {
            alert("Le nom d'utilisateur ne doit contenir que des lettres et chiffres");
            return;
        }

        if (username.length < 3 || username.length > 20) {
            alert("Le nom d'utilisateur doit faire 3-20 caractères");
            return;
        }

        // Vérification email existant 
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length > 0) {
            throw new Error("Cet email existe déjà. Utilisez un autre email ou connectez-vous.");
        }
        // Vérifie le mot de passe
        const isValidPassword = (password) => {
          const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
          return regex.test(password);
        };

        if (!isValidPassword(password)) {
          alert("Votre mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un symbole.");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        

        await sendEmailVerification(user);

        await setDoc(doc(db, "users", user.uid), {
          username,
          email,
          createdAt: new Date()
        });

        // alert("Compte créé !");
        alert("Compte créé ! Un email de vérification vous a été envoyé.");
        window.location.href = "login.html";
      } catch (error) {
            if (error.message.includes("existe déjà") || error.code === 'auth/email-already-in-use') {
              alert("Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.");
          } else {
              alert("Erreur : " + error.message);
          }
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
      
        if (!user.emailVerified) {
          alert("Veuillez vérifier votre email.");
          await signOut(auth);
          return;
        }
      
        failedAttempts = 0; // Reset échecs
      
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const username = userDoc.data().username;
          localStorage.setItem("username", username);
          socket.emit("setUsername", username);
        } else {
          const guestName = `Guest${Math.floor(Math.random() * 10000)}`;
          localStorage.setItem("username", guestName);
          socket.emit("setUsername", guestName);
        }
      
        alert("Connexion réussie !");
        window.location.href = "games.html";
      } catch (error) {
        failedAttempts++;
        if (failedAttempts >= 3) {
          alert("Trop de tentatives. Veuillez réessayer plus tard.");
          loginForm.querySelector("button").disabled = true;
          setTimeout(() => {
            loginForm.querySelector("button").disabled = false;
            failedAttempts = 0;
          }, 60000); // Bloqué pendant 1 minute
        } else {
          alert("Erreur : " + error.message);
        }
      }
      });
  }

  onAuthStateChanged(auth, async (user) => {
    let username = "";

    if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            username = docSnap.data().username;
        } else {
            username = `Guest${Math.floor(Math.random() * 10000)}`;
        }
    } else {
        username = `Guest${Math.floor(Math.random() * 10000)}`;
    }

    // Stockage global
    window.username = username;
    localStorage.setItem("username", username);

    // Si socket est déjà ouvert, on émet immédiatement
    if (window.socket) {
        window.socket.emit("setUsername", username);
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

// window.resetPassword = function () {
//   const email = prompt("Entrez votre adresse email :");
//   if (email) {
//     sendPasswordResetEmail(auth, email)
//       .then(() => alert("Email de réinitialisation envoyé."))
//       .catch((error) => alert("Erreur : " + error.message));
//   }
// };


window.resetPassword = async function () {
  const email = prompt("Entrez votre adresse email :");
  if (email) {
    try {
      // Vérifie si l'email existe
      const methods = await fetchSignInMethodsForEmail(auth, email);
      
      if (methods.length === 0) {
        alert("Cet email n'est associé à aucun compte. Vérifiez l'email ou créez un compte.");
        return;
      }

      // Si l'email existe, envoyer l'email de réinitialisation
      await sendPasswordResetEmail(auth, email);
      alert("Un email de réinitialisation a été envoyé à " + email);
    } catch (error) {
      if (error.code === 'auth/invalid-email') {
        alert("L'email saisi est invalide. Veuillez entrer une adresse email valide.");
      } else {
        alert("Erreur : " + error.message);
      }
    }
  }
};