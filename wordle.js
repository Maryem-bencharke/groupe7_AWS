const socket = io("http://127.0.0.1:3000"); // Connexion au serveur Socket.io

let room = null;
let targetWord = "";
const maxAttempts = 6;
let currentAttempt = 0;
let currentGuess = "";

// Connexion au serveur et attente d'un adversaire
socket.on("waiting", (message) => {
    alert(message);
});

socket.on("startGame", (data) => {
    if (!data.word) {
        console.error("Erreur: le mot n'a pas été défini !");
        return;
    }

    alert(` Partie trouvée ! Devinez un mot de ${data.wordLength} lettres.`);
    room = data.room;
    targetWord = data.word.toUpperCase();  // Définir le mot cible
});

// Mise à jour du jeu lorsqu'un adversaire joue
socket.on("updateGame", (data) => {
    console.log(`L'adversaire a proposé : ${data.guess}`);
});

// Fin de la partie
socket.on("gameOver", (data) => {
    if (data.winner === socket.id) {
        alert(" Vous avez gagné !");
    } else {
        alert(`Vous avez perdu. Le mot était : ${data.correctWord}`);
    }
});

// Écouteur pour le clavier physique
document.addEventListener("keydown", (event) => {
    const key = event.key.toUpperCase();

    if (key === "ENTER") {
        event.preventDefault();
        if (currentGuess.length === targetWord.length) {
            checkWord();
            socket.emit("guessWord", { room, guess: currentGuess });
        }
    } else if (key === "BACKSPACE" && currentGuess.length > 0) {
        currentGuess = currentGuess.slice(0, -1);
        updateGrid();
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < targetWord.length) {
        currentGuess += key;
        updateGrid();
    }
});

// Vérifier si le mot est correct et gérer les couleurs
function checkWord() {
    if (!room) {
        console.error("Erreur: la room n'a pas été définie !");
        return;
    }

    if (currentGuess.length !== targetWord.length) return;

    for (let i = 0; i < targetWord.length; i++) {
        const cell = document.getElementById(`cell-${currentAttempt}-${i}`);
        const letter = currentGuess[i];

        if (letter === targetWord[i]) {
            cell.style.backgroundColor = "green";  // Lettre bien placée
        } else if (targetWord.includes(letter)) {
            cell.style.backgroundColor = "orange";  // Lettre mal placée
        } else {
            cell.style.backgroundColor = "grey";  // Mauvaise lettre
        }
    }

    if (currentGuess === targetWord) {
        socket.emit("gameOver", { room, winner: socket.id, correctWord: targetWord });
        alert("Bravo, vous avez trouvé le mot !");
        return;
    }

    currentAttempt++;
    currentGuess = "";

    if (currentAttempt >= maxAttempts) {
        socket.emit("gameOver", { room, winner: "opponent", correctWord: targetWord });
        alert(`Dommage ! Le mot était : ${targetWord}`);
    }
}

// Informer le serveur qu'on veut rejoindre une partie
document.addEventListener("DOMContentLoaded", () => {
    socket.emit("joinGame");
});
