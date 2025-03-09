import { collection, query, where, getDocs, doc} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

const socket = io("http://127.0.0.1:3000"); // Connexion au serveur

let room = null;
let life = 6;
let wordToGuess = "";
let lettersTyped = [];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let gameEnded = false;
let gameMode = null;
let wordCount = 0;

// Sélection du mode de jeu
async function startGame(mode) {
    gameMode = mode;
    document.getElementById("modeSelection").style.display = "none";
    document.getElementById("gameContainer").style.display = "block";

    if (mode === "multi") {
        socket.emit("joinGame", "pendu"); //Envoyer au serveur UNIQUEMENT si c'est du multijoueur
    } else {
        wordToGuess = await getRandomWord1()
        wordToGuess = wordToGuess.toUpperCase();
        initGame();
    }
}
window.startGame = startGame;

// Empêcher le message "Attente d'un adversaire" si c'est le mode solo
socket.on("waiting", (message) => {
    if (gameMode === "multi") {
        alert(message);
    }
});

// Initialisation du jeu
function initGame() {
    clearHangman(); //Effacer l'ancien pendu avant de recommencer
    document.getElementById("word-display").innerText = "_ ".repeat(wordToGuess.length);
    createVirtualKeyboard();
    addKeyboardEvent();
}

// Mode multijoueur : réception du mot du serveur
socket.on("startGame", (data) => {
    if (gameMode === "multi") {
        room = data.room;
        wordToGuess = data.word.toUpperCase();
        initGame();
    }
});

// Mode solo : génération d'un mot aléatoire
async function getRandomWord() {
    try {
        const random = ~~(Math.random() * wordCount);
        const wordQuery = query(collection(db, "words"), where("id", "==", random));
        const querySnapshot = await getDocs(wordQuery);
        if (!querySnapshot.empty) {
            console.log("mot trouvé " + querySnapshot.docs[0].data().word.toUpperCase())
            return querySnapshot.docs[0].data().word.toUpperCase();
        } else {
            console.log("Aucun mot trouvé dans la base de données")
            return null;
        }
    } catch (error) {
        console.error("Erreur lors de la récupération :", error);
    }
}

async function getWordCount() {
    try {
        const querySnapshot = await getDocs(collection(db, "words"));
        wordCount = querySnapshot.size;
    } catch (error) {
        console.error("Erreur lors de la récupération du nombre de mots :", error);
    }
}

// Création du clavier virtuel
function createVirtualKeyboard() {
    let keyboard = document.getElementById("keyboard");
    keyboard.innerHTML = ""; 

    for (let letter of alphabet) {
        let button = document.createElement("button");
        button.innerText = letter;
        button.id = letter;
        button.classList.add("letter");
        button.onclick = function () {
            if (!gameEnded) {
                guess(letter);
                if (gameMode === "multi") socket.emit("guessLetter", { room, letter });
            }
        };
        keyboard.appendChild(button);
    }
}

// Ajout des événements clavier
function addKeyboardEvent() {
    document.addEventListener("keydown", keyboardEventHandler);
}

// Suppression des événements clavier
function removeKeyboardEvent() {
    document.removeEventListener("keydown", keyboardEventHandler);
}

// Gestion des entrées clavier physiques
function keyboardEventHandler(event) {
    if (gameEnded) return;

    let letter = event.key.toUpperCase();
    if (alphabet.includes(letter) && !lettersTyped.includes(letter)) {
        guess(letter);
        if (gameMode === "multi") socket.emit("guessLetter", { room, letter });
    }
}

// Vérification des lettres entrées
function guess(letterGuessed) {
    if (gameEnded || lettersTyped.includes(letterGuessed)) return;

    lettersTyped.push(letterGuessed);
    document.getElementById(letterGuessed).disabled = true;

    if (wordToGuess.includes(letterGuessed)) {
        updateWordDisplay(letterGuessed);
    } else {
        life -= 1;
        if (life >= 0) drawHangman(life);

        if (life === 0) {
            defeat();
            if (gameMode === "multi") socket.emit("gameOver", { room, winner: "opponent", correctWord: wordToGuess });
        }
    }
}

// Mise à jour de l'affichage du mot caché
function updateWordDisplay(letterGuessed) {
    let display = document.getElementById("word-display");
    let text = display.innerText.split(" ");
    for (let index in wordToGuess) {
        if (wordToGuess[index] === letterGuessed) text[index] = letterGuessed;
    }
    display.innerText = text.join(" ");

    if (!text.includes("_")) {
        victory();
        if (gameMode === "multi") socket.emit("gameOver", { room, winner: socket.id, correctWord: wordToGuess });
    }
}

// Fin immédiate de la partie en multijoueur
socket.on("gameOver", (data) => {
    if (!gameEnded) {
        gameEnded = true;
        if (data.winner === socket.id) {
            victory();
        } else {
            defeat();
        }
    }
});

// Mode solo : affichage du message de victoire ou de défaite avec option de rejouer ou retourner au menu
function victory() {
    alert("Vous avez gagné !");
    gameEnded = true;
    document.getElementById("endBanner").style.display = "block";
    document.getElementById("victoryBanner").innerText = "Victoire !";
    blockVirtualKeyboard();
    removeKeyboardEvent();
    if (gameMode === "solo") showReplayOptions();
}

function defeat() {
    alert("Vous avez perdu !");
    gameEnded = true;
    document.getElementById("endBanner").style.display = "block";
    document.getElementById("victoryBanner").innerText = "Défaite !";
    blockVirtualKeyboard();
    removeKeyboardEvent();
    if (gameMode === "solo") showReplayOptions();
}

// Efface l'ancien pendu
function clearHangman() {
    const canvas = document.getElementById("hangmanCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Affichage des options pour rejouer ou retourner au menu
function showReplayOptions() {
    document.getElementById("endBanner").style.display = "block";
}

// Retourner au menu principal
function goToMainMenu() {
    location.reload();
}
window.goToMainMenu = goToMainMenu;

// Réinitialisation du jeu
async function resetGame() {
    gameEnded = false;
    life = 6;
    lettersTyped = [];
    wordToGuess = await getRandomWord1()
    wordToGuess = wordToGuess.toUpperCase();
    document.getElementById("word-display").innerText = "_ ".repeat(wordToGuess.length);
    document.getElementById("endBanner").style.display = "none";
    clearHangman();
    createVirtualKeyboard();
    addKeyboardEvent();
}
window.resetGame = resetGame;


// Désactivation du clavier après la fin du jeu
function blockVirtualKeyboard() {
    let buttons = document.getElementsByClassName("letter");
    for (let button of buttons) {
        button.disabled = true;
    }
}

// Dessiner le pendu
function drawHangman(step) {
    const canvas = document.getElementById("hangmanCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;

    switch (step) {
        case 5: ctx.beginPath(); ctx.arc(100, 30, 15, 0, Math.PI * 2); ctx.stroke(); break;
        case 4: ctx.beginPath(); ctx.moveTo(100, 45); ctx.lineTo(100, 100); ctx.stroke(); break;
        case 3: ctx.beginPath(); ctx.moveTo(100, 60); ctx.lineTo(75, 80); ctx.stroke(); break;
        case 2: ctx.beginPath(); ctx.moveTo(100, 60); ctx.lineTo(125, 80); ctx.stroke(); break;
        case 1: ctx.beginPath(); ctx.moveTo(100, 100); ctx.lineTo(75, 130); ctx.stroke(); break;
        case 0: ctx.beginPath(); ctx.moveTo(100, 100); ctx.lineTo(125, 130); ctx.stroke();
            ctx.fillText("X   X", 90, 25);
            ctx.fillText("  -  ", 90, 35);
            break;
    }
}

function getRandomWord1() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("pomme");
        }, 2000);
    });
}

function getWordCount1() {
    return 1
}

function getChoosenWord() {
    const word = document.getElementById("choosenWord");
    word.style="display: none";
    socket.emit("wordChoosen", (word.value));
}

function showChoosenWordDisplay() {
    const word = document.getElementById("choosenWord");
    word.style = "display: block";
}

// Initialisation du jeu
document.addEventListener("DOMContentLoaded", async () => {
    await getWordCount1();
    console.log("Jeu prêt");
});
