import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { io } from "https://cdn.socket.io/4.4.1/socket.io.min.js";

const socket = io("http://127.0.0.1:3000"); // Connexion au serveur
let room = null;
let life = 6;
let wordToGuess = "";
let lettersTyped = [];
let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let wordCount = 0;

// Gestion du matchmaking
socket.on("waiting", (message) => {
    alert(message);
});

socket.on("startGame", (data) => {
    alert("Partie trouvée ! Devinez le mot !");
    room = data.room;
    wordToGuess = data.word.toUpperCase();
    document.getElementById("word-display").innerText = "_ ".repeat(wordToGuess.length);
});

socket.on("opponentGuess", (data) => {
    console.log(`L'adversaire a tenté la lettre : ${data.letter}`);
});

socket.on("gameOver", (data) => {
    if (data.winner === socket.id) {
        alert("Vous avez gagné !");
    } else {
        alert(`Vous avez perdu. Le mot était : ${data.correctWord}`);
    }
});

// Gestion des entrées clavier
let keyboardEventHandler = (event) => {
    event.preventDefault();
    let letter = event.key.toUpperCase();
    if (alphabet.includes(letter) && !lettersTyped.includes(letter)) {
        guess(letter);
        socket.emit("guessLetter", { room, letter });
    }
};

function guess(letterGuessed) {
    if (!lettersTyped.includes(letterGuessed)) {
        lettersTyped.push(letterGuessed);
        document.getElementById(letterGuessed).disabled = true;

        if (wordToGuess.includes(letterGuessed)) {
            let display = document.getElementById("word-display");
            let text = display.innerText.split(" ");
            for (let index in wordToGuess) {
                if (wordToGuess[index] === letterGuessed) {
                    text[index] = letterGuessed;
                }
            }
            display.innerText = text.join(" ");
            if (!text.includes("_")) {
                victory();
                socket.emit("gameOver", { room, winner: socket.id, correctWord: wordToGuess });
            }
        } else {
            life -= 1;
            drawHangman(life);
            if (life < 1) {
                defeat();
                socket.emit("gameOver", { room, winner: "opponent", correctWord: wordToGuess });
            }
        }
    }
}

function createVirtualKeyboard() {
    let Virtualkeyboard = document.getElementById('keyboard');
    for (let letter of alphabet) {
        let button = document.createElement("button");
        button.innerText = letter;
        button.id = letter;
        button.classList.add("letter");
        button.onclick = function () {
            guess(letter);
            socket.emit("guessLetter", { room, letter });
        };
        Virtualkeyboard.appendChild(button);
    }
}

function addKeyboardEvent() {
    document.addEventListener("keydown", keyboardEventHandler);
}

function removeKeyboardEvent() {
    document.removeEventListener("keydown", keyboardEventHandler);
}

function victory() {
    document.getElementById("endBanner").style.display = "block";
    document.getElementById("victoryBanner").innerText = "Victoire !";
    blockVirtualKeyboard();
    removeKeyboardEvent();
}

function defeat() {
    document.getElementById("endBanner").style.display = "block";
    document.getElementById("victoryBanner").innerText = "Défaite !";
    blockVirtualKeyboard();
    removeKeyboardEvent();
}

function hideEndBanner() {
    document.getElementById("endBanner").style.display = "none";
}

function blockVirtualKeyboard() {
    let buttons = document.getElementsByClassName("letter");
    for (let button of buttons) {
        button.disabled = true;
    }
}

function activateVirtualKeyboard() {
    let buttons = document.getElementsByClassName("letter");
    for (let button of buttons) {
        button.disabled = false;
    }
}

function drawHangman(step) {
    const canvas = document.getElementById("hangmanCanvas");
    switch (step) {
        case 5: // tête
            break;
        case 4: // corps
            break;
        case 3: // bras gauche
            break;
        case 2: // bras droit
            break;
        case 1: // jambe gauche
            break;
        case 0: // jambe droite + X_X
            break;
    }
}

function clearHangman() {
    const canvas = document.getElementById("hangmanCanvas");
    // Remettre à zéro le canvas
}

document.addEventListener("DOMContentLoaded", () => {
    createVirtualKeyboard();
    addKeyboardEvent();
    socket.emit("joinGame");
});
