const socket = io("http://127.0.0.1:3000"); // Connexion au serveur

let room = null;
let life = 6;
let wordToGuess = "";
let lettersTyped = [];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let gameEnded = false; //Empêcher le joueur de continuer après la fin

// ✅ Gestion du matchmaking et début de partie
socket.on("startGame", (data) => {
    console.log("🎮 Partie trouvée !", data);
    alert("🎮 Partie trouvée ! Devinez le mot !");
    
    room = data.room;
    wordToGuess = data.word.toUpperCase();
    
    document.getElementById("word-display").innerText = "_ ".repeat(wordToGuess.length);

    createVirtualKeyboard();
    addKeyboardEvent();
});

// ✅ Création du clavier virtuel
function createVirtualKeyboard() {
    let keyboard = document.getElementById("keyboard");
    if (!keyboard) {
        console.error("ERREUR : Élément clavier introuvable !");
        return;
    }

    keyboard.innerHTML = ""; // Nettoyer le clavier pour éviter les doublons

    for (let letter of alphabet) {
        let button = document.createElement("button");
        button.innerText = letter;
        button.id = letter;
        button.classList.add("letter");
        button.onclick = function () {
            if (!gameEnded) {
                guess(letter);
                socket.emit("guessLetter", { room, letter });
            }
        };
        keyboard.appendChild(button);
    }

    console.log("Clavier virtuel chargé !");
}

//Gérer les entrées clavier physiques
function addKeyboardEvent() {
    document.addEventListener("keydown", keyboardEventHandler);
}

// ❌ Supprimer les événements clavier si le jeu est terminé
function removeKeyboardEvent() {
    document.removeEventListener("keydown", keyboardEventHandler);
}

// ✅ Fonction qui gère les touches du clavier physique
function keyboardEventHandler(event) {
    if (gameEnded) return; //Bloque les entrées si la partie est finie

    let letter = event.key.toUpperCase();
    if (alphabet.includes(letter) && !lettersTyped.includes(letter)) {
        guess(letter);
        socket.emit("guessLetter", { room, letter });
    }
}

// ✅ Fonction `guess()` corrigée
function guess(letterGuessed) {
    if (gameEnded) return; //Bloque si le jeu est terminé

    if (!lettersTyped.includes(letterGuessed)) {
        lettersTyped.push(letterGuessed);
        document.getElementById(letterGuessed).disabled = true;

        if (wordToGuess.includes(letterGuessed)) {
            updateWordDisplay(letterGuessed);
        } else {
            life -= 1;
            if (life >= 0) {
                drawHangman(life);
            }

            // ✅ Envoie "gameOver" SEULEMENT SI `life == 0`
            if (life === 0) {
                defeat();
                socket.emit("gameOver", { room, winner: "opponent", correctWord: wordToGuess });
            }
        }
    }
}

//Met à jour l'affichage du mot caché
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

//Fonction `victory()`
function victory() {
    alert("🏆 Vous avez gagné !");
    gameEnded = true;
    document.getElementById("endBanner").style.display = "block";
    document.getElementById("victoryBanner").innerText = "Victoire !";
    blockVirtualKeyboard();
    removeKeyboardEvent();
}

//Fonction `defeat()`
function defeat() {
    alert("😢 Vous avez perdu !");
    gameEnded = true;
    document.getElementById("endBanner").style.display = "block";
    document.getElementById("victoryBanner").innerText = "Défaite !";
    blockVirtualKeyboard();
    removeKeyboardEvent();
}

//Désactiver le clavier après la fin de partie
function blockVirtualKeyboard() {
    let buttons = document.getElementsByClassName("letter");
    for (let button of buttons) {
        button.disabled = true;
    }
}

//Dessiner le pendu (fixé, toutes les parties sont bien affichées)
function drawHangman(step) {
    if (step < 0) return; // Évite les étapes négatives

    const canvas = document.getElementById("hangmanCanvas");
    if (!canvas) {
        console.error("❌ ERREUR : Canvas introuvable !");
        return;
    }

    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;

    console.log(`✏ Dessin du pendu, étape ${step}`);

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
        case 0: // Jambe droite + Visage triste
            ctx.beginPath();
            ctx.moveTo(100, 100);
            ctx.lineTo(125, 130);
            ctx.stroke();

            // ❌ Ajout d'un visage triste "X_X"
            ctx.fillText("X   X", 90, 25);
            ctx.fillText("  -  ", 90, 35);
            break;
    }
}

//Gestion immédiate de la fin de partie pour les deux joueurs
socket.on("gameOver", (data) => {
    gameEnded = true; //Bloque les entrées immédiatement
    if (data.winner === socket.id) {
        alert("🏆 Vous avez gagné !");
    } else {
        alert(`😢 Vous avez perdu. Le mot était : ${data.correctWord}`);
    }
    blockVirtualKeyboard();
    removeKeyboardEvent();
    document.getElementById("endBanner").style.display = "block";
    document.getElementById("victoryBanner").innerText =
        data.winner === socket.id ? "Victoire !" : "Défaite !";
});

//Initialisation du jeu
document.addEventListener("DOMContentLoaded", () => {
    console.log("📢 Page chargée, attente de connexion...");
    socket.emit("joinGame");
});
