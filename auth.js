import { auth } from "./firebase-config.js";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

const db = getFirestore();

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

// Gestion des formulaires d'inscription et connexion
document.addEventListener("DOMContentLoaded", function() {
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", async function(event) {
            event.preventDefault();

            let username = document.getElementById("username").value;
            let email = document.getElementById("email").value;
            let password = document.getElementById("password").value;

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await setDoc(doc(db, "users", user.uid), {
                    username: username,
                    email: email,
                    createdAt: new Date()
                });

                alert("Compte créé avec succès !");
                window.location.href = "login.html";
            } catch (error) {
                console.error("Erreur d'inscription :", error);
                alert("Erreur : " + error.message);
            }
        });
    }

    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async function(event) {
            event.preventDefault();

            let email = document.getElementById("login-email").value;
            let password = document.getElementById("login-password").value;

            try {
                await signInWithEmailAndPassword(auth, email, password);
                alert("Connexion réussie !");
                window.location.href = "games.html";
            } catch (error) {
                console.error("Erreur de connexion :", error);
                alert("Erreur : " + error.message);
            }
        });
    }

    // Ajoute ceci à la fin de ton fichier auth.js (juste avant la fin)

onAuthStateChanged(auth, (user) => {
    if (user) {
        // L'utilisateur est connecté
        localStorage.setItem('isLoggedIn', 'true');
    } else {
        // Pas connecté (invité)
        localStorage.setItem('isLoggedIn', 'false');
    }
});

});
