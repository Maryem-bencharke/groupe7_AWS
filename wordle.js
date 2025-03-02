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

    alert(`🎮 Partie trouvée ! Devinez un mot de ${data.wordLength} lettres.`);
    room = data.room;
    targetWord = data.word.toUpperCase();  // Définir le mot cible
    createGrid(targetWord.length);
});

// Mise à jour du jeu lorsqu'un adversaire joue
socket.on("updateGame", (data) => {
    console.log(`📝 L'adversaire a proposé : ${data.guess}`);
});

// Fin de la partie
socket.on("gameOver", (data) => {
    if (data.winner === socket.id) {
        alert("🏆 Vous avez gagné !");
    } else {
        alert(`😢 Vous avez perdu. Le mot était : ${data.correctWord}`);
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

// Écouteur pour le clavier virtuel
document.querySelectorAll(".keyboard button").forEach(button => {
    button.addEventListener("click", () => {
        const key = button.dataset.key;

        if (key === "Backspace" && currentGuess.length > 0) {
            currentGuess = currentGuess.slice(0, -1);
        } else if (key === "Enter" && currentGuess.length === targetWord.length) {
            checkWord();
            socket.emit("guessWord", { room, guess: currentGuess });
        } else if (/^[A-Z]$/.test(key) && currentGuess.length < targetWord.length) {
            currentGuess += key;
        }

        updateGrid();
    });
});

//Mise à jour de la grille affichée
function updateGrid() {
    for (let i = 0; i < targetWord.length; i++) {
        const cell = document.getElementById(`cell-${currentAttempt}-${i}`);
        cell.textContent = currentGuess[i] || "";
    }
}

//Création dynamique de la grille de jeu
function createGrid(wordLength) {
    const gridContainer = document.querySelector(".grid");
    gridContainer.innerHTML = ""; // Nettoie la grille existante

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const row = document.createElement("div");
        row.classList.add("row");

        for (let i = 0; i < wordLength; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.id = `cell-${attempt}-${i}`;
            row.appendChild(cell);
        }

        gridContainer.appendChild(row);
    }
}

//Vérification et affichage des couleurs des lettres
function checkWord() {
    if (!room) {
        console.error("Erreur: la room n'a pas été définie !");
        return;
    }

    if (currentGuess.length !== targetWord.length) return;

    let correctLetters = 0;

    for (let i = 0; i < targetWord.length; i++) {
        const cell = document.getElementById(`cell-${currentAttempt}-${i}`);
        const letter = currentGuess[i];

        if (letter === targetWord[i]) {
            cell.style.backgroundColor = "green";  
            correctLetters++;
        } else if (targetWord.includes(letter)) {
            cell.style.backgroundColor = "orange";  
        } else {
            cell.style.backgroundColor = "grey";  
        }
    }

    if (correctLetters === targetWord.length) {
        socket.emit("gameOver", { room, winner: socket.id, correctWord: targetWord });
        alert("🏆 Bravo, vous avez trouvé le mot !");
        return;
    }

    currentAttempt++;
    currentGuess = "";

    if (currentAttempt >= maxAttempts) {
        socket.emit("gameOver", { room, winner: "opponent", correctWord: targetWord });
        alert(`😢 Dommage ! Le mot était : ${targetWord}`);
    }
}

// Informer le serveur qu'on veut rejoindre une partie
document.addEventListener("DOMContentLoaded", () => {
    socket.emit("joinGame");
});
