const socket = io("http://127.0.0.1:3000");

let usedWords = [];
let currentSyllable;
let life = 3;
let timer;
let bombTimer;
let currentStreak = 0;
let maxStreak = 0;
let roomName;
let currentPlayerTurn;

//
// Création des interfaces et gestions des boutons
//

// permet au bouton rejouer de rejoindre la partie en cours
function setButtonJoinGame() {
    const join = document.getElementById("joinButton");
    join.addEventListener("click", () => {
        socket.emit("joinBombGame", (roomName));
        hideJoinButton();
    });
    
}

function hideJoinButton() {
    const join = document.getElementById("joinButton");
    join.style.display = "none";
}

function showJoinButton() {
    const join = document.getElementById("joinButton");
    join.style.display = "block";
}

function hideTextArea() {
    const textArea = document.getElementById("textArea");
    textArea.style.display = "none";
}

function showTextArea() {
    const textArea = document.getElementById("textArea");
    textArea.style.display = "block";
}

function eraseTextArea() {
    document.getElementById("textArea").value = "";
}

//
// Fonctions gérant l'affichage sur le jeu
//


socket.on("loadJoiningPlayer", () => {
    // affichage sur l'écran des joueurs
});

socket.on("updateTimer", (timeLeft) => {
    // affiche un temps restant avant que la partie se lance avec les joueurs actuels
    const timer = document.getElementById("remainingTime");
    timer.innerText = `Temps restant avant lancement automatique ${timeLeft}s`;
});

socket.on("refresh", (syllable, currentTurn) => {
    reloadSyllableDisplay(syllable);
    currentPlayerTurn = currentTurn;
});

socket.on("validate", () => {
    eraseTextArea();
    hideTextArea();
    clearInterval(bombTimer);
});

socket.on("explosion", () => {
    console.log("effacement");
    eraseTextArea();
    hideTextArea();
})

//
// Gestion des communications client/serveur
//


socket.on("startTurn", (bombGameMinTimer) => {
    showTextArea();


    //socket.emit("explosion", ({name: roomName, currentTurn: currentPlayerTurn}));
            
})


// permet de créer l'alphabet bonus permettant de regagner une vie
function createBonusLetters(alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    //
}

function guess(word) {
   // peut être vérifier en local si le mot est valide avant de faire la requete pour vérifier
    socket.emit("guessBombWord", (word, roomName, currentTurn));

}

function checkDefeat(life) {
    if (life < 1) {
        document.getElementById("endBanner").style.display = "block";
        let text = document.getElementById("victoryBanner");
        text.innerText = "Défaite";
        hideTextArea();
        if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
        }
        currentStreak = 0;
        loadScore();
        return true;
    } else {
        return false;
    }
}

function reloadSyllableDisplay(syllable) {
    document.getElementById("syllableDisplay").innerText = syllable;
}

function startOrResetTimer() {
    if (timer) {
        clearInterval(timer);
    }
    let timeLeft = 5.1;
    let timerDisplay = document.getElementById("timer");
    timer = setInterval(() => {
        timeLeft -= 0.10;
        timerDisplay.innerText = timeLeft.toFixed(1) + "s";
        if (timeLeft <= 0.05) {
            clearInterval(timer);
            guessTimeout();
        }
    }, 100);
}

function guessTimeout() {
    life -= 1;
    if (checkDefeat(life)) {
        clearTimeout(timer);
    } else {
        currentSyllable = getRandomSyllable();
        reloadSyllableDisplay(currentSyllable);
        eraseTextArea();
        startOrResetTimer();
    }
}

function hideEndBanner() {
    document.getElementById("endBanner").style.display = "none";
}

function replayButton() {
    let replay = document.getElementById("buttonReplay");
    replay.addEventListener("click", () => {
        currentSyllable = getRandomSyllable();
        reloadSyllableDisplay(currentSyllable);
        life = 3;
        usedWords = [];
        hideEndBanner();
        startOrResetTimer();
        document.getElementById("textArea").focus();
    });
}

function loadScore() {
    document.getElementById("maxStreak").innerText = "Maximum : " + maxStreak;
    document.getElementById("currentStreak").innerText = "Score actuel : " + currentStreak;
}

function showStreak() {
    document.getElementById("currentStreak").innerText = "Score actuel : " + currentStreak;
}

function removeAccents(str) {
    return str
        .normalize("NFD") // Décompose les caractères accentués
        .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
        .replace(/[^a-zA-Z]/g, "");
}

document.addEventListener("keydown", (event) => {
    const key = event.key.toUpperCase();
    if (key === "ENTER") {
        let text = document.getElementById("textArea").value.toUpperCase();
        text = removeAccents(text);
        socket.emit("guessBombWord", ({word: text, name: roomName}));
    }
});

document.addEventListener("DOMContentLoaded", () => {
    //currentSyllable = getRandomSyllable();
    //reloadSyllableDisplay(currentSyllable);
    //startOrResetTimer();
    //replayButton();
    //loadScore();

    setButtonJoinGame();
    roomName = localStorage.getItem("name");
    if (roomName) {
        // mode multi
        socket.emit("joinBombRoom", (roomName));
    } else {
        // mode solo
        socket.emit("getRandomSyllable");
    }
    

    //document.getElementById("textArea").focus();
});
