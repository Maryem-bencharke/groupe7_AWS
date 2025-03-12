import { auth } from "./firebase-config.js";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

const db = getFirestore();

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

                // Ajouter le champ bilan et classement
                await setDoc(doc(db, "users", user.uid), {
                    username: username,
                    email: email,
                    bilan: "0-0",
                    ranking: 0
                });

                console.log("Compte créé avec succès");
            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    alert("Erreur : L'adresse e-mail est déjà utilisée.");
                } else {
                    console.error("Erreur lors de la création du compte:", error);
                    alert("Erreur lors de la création du compte: " + error.message);
                }
            }
        });
    } else {
        console.error("signup-form non trouvé");
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
    } else {
        console.error("login-form non trouvé");
    }
});

// Fonction pour mettre à jour les victoires et les défaites
async function updateBilan(userId, isVictory) {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        let [victories, defeats] = userDoc.data().bilan.split('-').map(Number);

        if (isVictory) {
            victories += 1;
        } else {
            defeats += 1;
        }

        const newBilan = `${victories}-${defeats}`;
        await updateDoc(userRef, {
            bilan: newBilan
        });
        console.log("Bilan mis à jour avec succès");
    } else {
        console.error("Utilisateur non trouvé");
    }
}

// Fonction pour mettre à jour le classement de tous les utilisateurs
async function updateAllRankings() {
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);
    const users = [];

    usersSnapshot.forEach(doc => {
        const data = doc.data();
        const [victories, defeats] = data.bilan.split('-').map(Number);
        users.push({ id: doc.id, victories, defeats });
    });

    // Trier les utilisateurs par victoires (descendant) puis par défaites (ascendant)
    users.sort((a, b) => {
        if (a.victories === b.victories) {
            return a.defeats - b.defeats;
        }
        return b.victories - a.victories;
    });

    // Mettre à jour le classement de chaque utilisateur
    for (let i = 0; i < users.length; i++) {
        const userRef = doc(db, "users", users[i].id);
        await updateDoc(userRef, {
            ranking: i + 1
        });
    }

    console.log("Classements mis à jour avec succès");
}