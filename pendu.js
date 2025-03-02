const socket = io("http://127.0.0.1:3000"); // Connexion au serveur

let room = null;
let life = 6;
let wordToGuess = "";
let lettersTyped = [];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

//Gestion du matchmaking et début de partie
socket.on("waiting", (message) => {
    alert(message);
});

socket.on("startGame", (data) => {
    alert("🎮 Partie trouvée ! Devinez le mot !");
    room = data.room;
    wordToGuess = data.word.toUpperCase();
    document.getElementById("word-display").innerText = "_ ".repeat(wordToGuess.length);

    createVirtualKeyboard();
    addKeyboardEvent();
});

//Événements de l’adversaire
socket.on("opponentGuess", (data) => {
    console.log(`📝 L'adversaire a tenté la lettre : ${data.letter}`);
});

//Fin de partie immédiate
socket.on("gameOver", (data) => {
    if (data.winner === socket.id) {
        alert("🏆 Vous avez gagné !");
    } else {
        alert(`😢 Vous avez perdu. Le mot était : ${data.correctWord}`);
    }

    //Désactiver le clavier et bloquer le jeu après la fin
    blockVirtualKeyboard();
    removeKeyboardEvent();

    //Affichage du message de fin
    document.getElementById("endBanner").style.display = "block";
    document.getElementById("victoryBanner").innerText =
        data.winner === socket.id ? "Victoire !" : "Défaite !";
});

//Ajout des événements clavier physique
function addKeyboardEvent() {
    document.addEventListener("keydown", keyboardEventHandler);
}

//Suppression des événements clavier lorsque le jeu se termine
function removeKeyboardEvent() {
    document.removeEventListener("keydown", keyboardEventHandler);
}

//Gestion du clavier physique
let keyboardEventHandler = (event) => {
    let letter = event.key.toUpperCase();
    if (alphabet.includes(letter) && !lettersTyped.includes(letter)) {
        guess(letter);
        socket.emit("guessLetter", { room, letter });
    }
};

//Vérification des lettres et mise à jour de l'affichage
function guess(letterGuessed) {
    if (!lettersTyped.includes(letterGuessed)) {
        lettersTyped.push(letterGuessed);
        document.getElementById(letterGuessed).disabled = true;

        if (wordToGuess.includes(letterGuessed)) {
            updateWordDisplay(letterGuessed);
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

//Mise à jour du mot affiché
function updateWordDisplay(letterGuessed) {
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
}

//Création du clavier virtuel
function createVirtualKeyboard() {
    let keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = ""; // Nettoyer le clavier

    for (let letter of alphabet) {
        let button = document.createElement("button");
        button.innerText = letter;
        button.id = letter;
        button.classList.add("letter");
        button.onclick = function () {
            guess(letter);
            socket.emit("guessLetter", { room, letter });
        };
        keyboard.appendChild(button);
    }
}

//Gérer la victoire
function victory() {
    document.getElementById("endBanner").style.display = "block";
    document.getElementById("victoryBanner").innerText = "Victoire !";
    blockVirtualKeyboard();
    removeKeyboardEvent();
}

//Gérer la défaite
function defeat() {
    document.getElementById("endBanner").style.display = "block";
    document.getElementById("victoryBanner").innerText = "Défaite !";
    blockVirtualKeyboard();
    removeKeyboardEvent();
}

//Désactiver le clavier
function blockVirtualKeyboard() {
    let buttons = document.getElementsByClassName("letter");
    for (let button of buttons) {
        button.disabled = true;
    }
}

//Dessiner le pendu
function drawHangman(step) {
    const canvas = document.getElementById("hangmanCanvas");
    const ctx = canvas.getContext("2d");
    
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;

    switch (step) {
        case 5: // Tête
            ctx.beginPath();
            ctx.arc(100, 30, 15, 0, Math.PI * 2);
            ctx.stroke();
            break;
        case 4: // Corps
            ctx.beginPath();
            ctx.moveTo(100, 45);
            ctx.lineTo(100, 100);
            ctx.stroke();
            break;
        case 3: // Bras gauche
            ctx.beginPath();
            ctx.moveTo(100, 60);
            ctx.lineTo(75, 80);
            ctx.stroke();
            break;
        case 2: // Bras droit
            ctx.beginPath();
            ctx.moveTo(100, 60);
            ctx.lineTo(125, 80);
            ctx.stroke();
            break;
        case 1: // Jambe gauche
            ctx.beginPath();
            ctx.moveTo(100, 100);
            ctx.lineTo(75, 130);
            ctx.stroke();
            break;
        case 0: // Jambe droite + Face triste
            ctx.beginPath();
            ctx.moveTo(100, 100);
            ctx.lineTo(125, 130);
            ctx.stroke();

            // X_X sur le visage
            ctx.fillText("X   X", 90, 25);
            ctx.fillText("  -  ", 90, 35);
            break;
    }
}

//Rejouer une partie
document.getElementById("buttonReplay").addEventListener("click", () => {
    location.reload();
});

//Initialisation du jeu
document.addEventListener("DOMContentLoaded", () => {
    socket.emit("joinGame");
});
