const socket = io('https://groupe7-aws.onrender.com');

let usedWords = [];
let syllables = ["NS", "ALO", "ES", "TR", "CON", "PO", "AIE", "NT", "IS", "TO", "ER", "EN", "ONI", "ONS", "UR", "MI", "SIO", "NAU", "RIS", "SSE", "ASS", "TS", "SUR", "LAS", "HE", "GO", "SSA", "GN", "ANC", "EZ", "ON"]
let currentSyllable;
let life = 3;
let timer;
let joinTimer;
let currentStreak = 0;
let maxStreak = 0;
let roomName;

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


//
// Gestion des communications client/serveur
//


socket.on("startTurn", () => {
    showTextArea();
    startOrResetTimer();

})


// permet de créer l'alphabet bonus permettant de regagner une vie
function createBonusLetters(alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    //
}

async function guess(word, syllable) {
    // si le mot à la syllabe et que le mot existe et que le mot est pas deja tape
    //if (word.includes(syllable) && !usedWords.includes(word) && await checkWord(word)) {
        //usedWords.push(word);
        //currentStreak += 1;
        //currentSyllable = getRandomSyllable();
        //reloadSyllableDisplay(currentSyllable);
        //showStreak();
        eraseTextArea();
        //startOrResetTimer();
    //} else {
    //    eraseTextArea();
   // }

   // peut être vérifier en local si le mot est valide avant de faire la requete pour vérifier
    socket.emit("guessBombWord", (word, roomName));

}

function getRandomSyllable() {
    return syllables[~~(Math.random() * syllables.length)];
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

async function checkWord(word) {
    const url = `https://api.datamuse.com/words?sp=${word}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.length > 0 && data[0].word.toLowerCase() === word.toLowerCase()) {
        return true;
    } else {
        return false;
    }
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
        const text = document.getElementById("textArea").value.toUpperCase();
        const syllable = document.getElementById("syllableDisplay").innerText;
        guess(removeAccents(text), syllable);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    currentSyllable = getRandomSyllable();
    reloadSyllableDisplay(currentSyllable);
    startOrResetTimer();
    replayButton();
    loadScore();

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
