import { getFirestore, doc, getDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { auth } from "./firebase-config.js";

const db = getFirestore();

async function updatePlayerStats(userId, isWinner) {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        let currentWins = userDoc.data().wins || 0;
        let currentLosses = userDoc.data().losses || 0;

        await updateDoc(userRef, {
            wins: isWinner ? currentWins + 1 : currentWins,
            losses: !isWinner ? currentLosses + 1 : currentLosses
        });
    } else {
        // Si le joueur n'existe pas encore, créer son document
        await setDoc(userRef, {
            username: userId,  // Remplace ceci par un vrai pseudo si disponible
            wins: isWinner ? 1 : 0,
            losses: isWinner ? 0 : 1
        });
    }
}
