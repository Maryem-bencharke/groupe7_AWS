const socket = io("http://127.0.0.1:3000");

let room = null;
let targetWord = "";
const maxAttempts = 6;
let currentAttempt = 0;
let currentGuess = "";
let gameMode = null;

//Fonction pour démarrer le jeu (Solo ou Multi)
function startGame(mode) {
    gameMode = mode;
    document.getElementById("modeSelection").style.display = "none";
    document.getElementById("gameContainer").style.display = "block";
    resetGame();

    if (mode === "multi") {
        socket.emit("joinGame");
    } else {
        targetWord = getRandomWord().toUpperCase();
        createGrid(targetWord.length);
    }
}

//Gestion de l'attente d'un joueur
socket.on("waiting", (message) => {
    if (gameMode === "multi") {
        alert(message);
    }
});

//Lancement de la partie en mode multijoueur
socket.on("startGame", (data) => {
    if (!data.word) {
        console.error("Erreur: le mot n'a pas été défini !");
        return;
    }
    
    room = data.room;
    targetWord = data.word.toUpperCase();
    createGrid(targetWord.length);
});

//Gestion des mises à jour pour l'adversaire
socket.on("updateGame", (data) => {
    console.log(`L'adversaire a proposé : ${data.guess}`);
});

//in de la partie
socket.on("gameOver", (data) => {
    alert(data.winner === socket.id ? "Vous avez gagné !" : `Vous avez perdu. Le mot était : ${data.correctWord}`);
    showEndScreen();
});

//Générer un mot aléatoire pour le mode solo
function getRandomWord() {
    const words = ["APPLE", "BANANA", "CHERRY", "ORANGE", "MELON"];
    return words[Math.floor(Math.random() * words.length)];
}

//Gestion des entrées clavier physique
document.addEventListener("keydown", (event) => {
    if (gameMode === null) return;
    const key = event.key.toUpperCase();
    
    if (key === "ENTER") {
        event.preventDefault();
        if (currentGuess.length === targetWord.length) {
            checkWord();
            if (gameMode === "multi") {
                socket.emit("guessWord", { room, guess: currentGuess });
            }
        }
    } else if (key === "BACKSPACE" && currentGuess.length > 0) {
        currentGuess = currentGuess.slice(0, -1);
        updateGrid();
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < targetWord.length) {
        currentGuess += key;
        updateGrid();
    }
});

//Gestion du clavier virtuel
document.querySelectorAll(".keyboard button").forEach(button => {
    button.addEventListener("click", () => {
        if (gameMode === null) return;
        const key = button.dataset.key;
        
        if (key === "Backspace" && currentGuess.length > 0) {
            currentGuess = currentGuess.slice(0, -1);
        } else if (key === "Enter" && currentGuess.length === targetWord.length) {
            checkWord();
            if (gameMode === "multi") {
                socket.emit("guessWord", { room, guess: currentGuess });
            }
        } else if (/^[A-Z]$/.test(key) && currentGuess.length < targetWord.length) {
            currentGuess += key;
        }
        
        updateGrid();
    });
});

//Création de la grille de jeu
function createGrid(wordLength) {
    const gridContainer = document.getElementById("grid");
    gridContainer.innerHTML = "";

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

//Mise à jour de la grille
function updateGrid() {
    for (let i = 0; i < targetWord.length; i++) {
        const cell = document.getElementById(`cell-${currentAttempt}-${i}`);
        if (cell) {
            cell.textContent = currentGuess[i] || "";
        }
    }
}

//Vérification du mot et mise à jour des couleurs
function checkWord() {
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
        if (gameMode === "multi") {
            socket.emit("gameOver", { room, winner: socket.id, correctWord: targetWord });
        }
        alert("Bravo, vous avez trouvé le mot !");
        showEndScreen();
        return;
    }

    currentAttempt++;
    currentGuess = "";
    if (currentAttempt >= maxAttempts) {
        if (gameMode === "multi") {
            socket.emit("gameOver", { room, winner: "opponent", correctWord: targetWord });
        }
        alert(`Dommage ! Le mot était : ${targetWord}`);
        showEndScreen();
    }
}

//Fonction pour réinitialiser la partie
function resetGame() {
    currentAttempt = 0;
    currentGuess = "";
    document.getElementById("grid").innerHTML = "";
    document.getElementById("endScreen").style.display = "none";
}

//Afficher l'écran de fin avec option rejouer/menu
function showEndScreen() {
    document.getElementById("endScreen").style.display = "block";
}

//Rejouer une partie
document.getElementById("replayButton").addEventListener("click", () => {
    startGame(gameMode);
});

//Retour au menu principal
document.getElementById("menuButton").addEventListener("click", () => {
    document.getElementById("modeSelection").style.display = "block";
    document.getElementById("gameContainer").style.display = "none";
    document.getElementById("endScreen").style.display = "none";
});
