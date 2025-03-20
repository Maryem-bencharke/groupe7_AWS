const socket = io("http://127.0.0.1:3000");

let usedWords = [];
let currentSyllable;
let life = 3;
let timer;
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

function addLobbyMember(name) {
    const table = document.getElementById("lobbyMembers");
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.innerText = name;
    tr.appendChild(td);
    table.appendChild(tr);
}

//
// Fonctions gérant l'affichage sur le jeu
//

socket.on("loadPlayers", (players) => {
    for (let player of players) {
        console.log(player + "a aaaaaaaaaaaaaa")
        addLobbyMember(player);
    }
});

socket.on("loadJoiningPlayer", (name) => {
    // affichage sur l'écran des joueurs
    addLobbyMember(name);
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

socket.on("validate", (mode) => {
    if (mode === "multi") {
        hideTextArea();
    } else {
        currentStreak += 1;
        showStreak();
    }
    
});

socket.on("explosion", (mode) => {
    eraseTextArea();
    if (mode === "multi") {
        hideTextArea();
    } else {
        if (maxStreak > currentStreak) {
            maxStreak = currentStreak;
        }
        currentStreak = 0;
        showStreak();
        loadScore();
    }
});

socket.on("defeat", () => {
    // afficher la bannière de défaite et rejouer
    document.getElementById("endBanner").style.display = "block";
    document.getElementById("victoryBanner").innerText = "plus longue série : " + maxStreak;    
});

//
// Gestion des communications client/serveur
//


socket.on("startTurn", () => {
    showTextArea();


    //socket.emit("explosion", ({name: roomName, currentTurn: currentPlayerTurn}));
            
})


// permet de créer l'alphabet bonus permettant de regagner une vie
function createBonusLetters(alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    //
}

function guess(word) {
   // peut être vérifier en local si le mot est valide avant de faire la requete pour vérifier
    socket.emit("guessBombWord", (word, roomName));

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
        hideEndBanner();
        // à compléter
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
        eraseTextArea();
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
        localStorage.removeItem("name");
    } else {
        // mode solo
        socket.emit("joinBombSolo", (roomName));
        hideJoinButton();
        document.getElementById("lobbyMembers").style.display = "none";
        replayButton();
        document.getElementById("scoreBoard").style.display = "block";
        loadScore();
        showStreak();
    }
    

    //document.getElementById("textArea").focus();
});
