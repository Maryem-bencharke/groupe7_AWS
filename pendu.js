const socket = io("http://127.0.0.1:3000"); // Connexion au serveur

let life = 6;
let wordToGuess = "";
let lettersTyped = [];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let gameMode = null;
let roomName;

socket.on("chooseWords", (msg) => {
    // afficher aux joueurs de taper un mot mour l'autre
});

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
    let letter = event.key.toUpperCase();
    if (alphabet.includes(letter) && !lettersTyped.includes(letter)) {
        if (!lettersTyped.includes(letter)) {
            guess(letter);
        }
    }
}

function addChooseWordEvent() {
    document.addEventListener("keydown", chooseWordEventHandler);
}

function removeChooseWordEvent() {
    document.removeEventListener("keydown", chooseWordEventHandler);
}

function chooseWordEventHandler(event) {
    if (!event.key) return;
        if (event.key.toUpperCase() === "ENTER") {
            const word = document.getElementById("choosenWord").value;
            if (word.length < 1) {
                // afficher un message pour dire trop petit
                alert("mot trop petit");
            } else {
                socket.emit("wordChoosen", ({name: roomName, word: word.toUpperCase()}));
                hideChoosenWordDisplay();
                removeChooseWordEvent();
            }     
        }
}

// affichage après avoir envoyé et reçu son mot
socket.on("startGuessing", (word) => {
    clearHangman();
    document.getElementById("word-display").innerText = word;
    createVirtualKeyboard();
    addKeyboardEvent();
});

function guess(letterGuessed) {
    lettersTyped.push(letterGuessed);
    document.getElementById(letterGuessed).disabled = true;
    socket.emit("guessLetter", {name: roomName, letter: letterGuessed});
}

socket.on("correctGuess", (word) => {
    updateWordDisplay(word);
});

socket.on("incorrectGuess", () => {
    life -= 1;
    if (life >= 0) drawHangman(life);
    if (life === 0) {
        if (roomName) {
            gameResult()
        } else {
            defeat();
        }
    }
})

// Mise à jour de l'affichage du mot caché
function updateWordDisplay(word) {
    let display = document.getElementById("word-display");
    let text = display.innerText.split(" ");
    for (let index in word) {
        if (word[index] != "_") {
            text[index] = word[index];
        }
    }
    display.innerText = text.join(" ");
    if (!text.includes("_")) {
        if (roomName) {
            gameResult();
        } else {
            victory();
        }
        
    }
}

socket.on("victory", (msg) => {
    showChoosenWordDisplay();
    clearHangman();
    document.getElementById("word-display").innerText = "";
    alert(msg);
    addChooseWordEvent();
    life = 6;
    lettersTyped = [];
});

socket.on("defeat", (msg) => {
    showChoosenWordDisplay();
    clearHangman();
    document.getElementById("word-display").innerText = "";
    alert(msg);
    addChooseWordEvent();
    life = 6;
    lettersTyped = [];
});

socket.on("even", (msg) => {
    showChoosenWordDisplay();
    clearHangman();
    document.getElementById("word-display").innerText = "";
    alert(msg);
    addChooseWordEvent();
    life = 6;
    lettersTyped = [];
});

// Empêcher le message "Attente d'un adversaire" si c'est le mode solo
socket.on("waiting", (message) => {
    if (gameMode === "multi") {
        alert(message);
    }
});

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
            if (!lettersTyped.includes(letter)) {
                guess(letter);
            }
        };
        keyboard.appendChild(button);
    }
}

function hideChoosenWordDisplay() {
    const word = document.getElementById("choosenWord");
    word.style = "display: none";
}

function gameResult() {
    blockVirtualKeyboard();
    removeKeyboardEvent();
    socket.emit("gameResult", ({name: roomName, life: life}));
}

// Mode solo : affichage du message de victoire ou de défaite avec option de rejouer ou retourner au menu
function victory() {
    document.getElementById("endBanner").style.display = "block";
    document.getElementById("victoryBanner").innerText = "Victoire";
    blockVirtualKeyboard();
    removeKeyboardEvent();
}

function defeat() {
    document.getElementById("endBanner").style.display = "block";
    document.getElementById("victoryBanner").innerText = "Défaite";
    blockVirtualKeyboard();
    removeKeyboardEvent();
}

// Efface l'ancien pendu
function clearHangman() {
    const canvas = document.getElementById("hangmanCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function replayButton() {
    let replay = document.getElementById("buttonReplay");
    replay.addEventListener("click", () => {
        createVirtualKeyboard();
        addKeyboardEvent();
        hideEndBanner();
        life = 6;
        lettersTyped = [];
        socket.emit("getRandomWord");
    });
}

function hideEndBanner() {
    document.getElementById("endBanner").style.display = "none";
}

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

function showChoosenWordDisplay() {
    const word = document.getElementById("choosenWord");
    word.style = "display: block";
    word.value = "";
    word.focus();
}

// Initialisation du jeu
document.addEventListener("DOMContentLoaded", () => {
    roomName = localStorage.getItem("name");
    if (roomName) {
        // mode multi
        socket.emit("joinRoom", (roomName));
        localStorage.removeItem("name");
        addChooseWordEvent();
    } else {
        // mode solo
        hideChoosenWordDisplay();
        socket.emit("getRandomWord");
    }
    replayButton();
    console.log("Jeu prêt");
});