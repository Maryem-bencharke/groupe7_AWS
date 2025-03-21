var socket = io('https://groupe7-aws.onrender.com');

let currentStreak = 0;
let maxStreak = 0;
let bombGameRoomName;
//let currentPlayerTurn;

//
// Création des interfaces et gestions des boutons
//

// permet au bouton rejouer de rejoindre la partie en cours
function setButtonJoinGame() {
    const join = document.getElementById("joinButton");
    join.addEventListener("click", () => {
        socket.emit("joinBombGame", (bombGameRoomName));
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
    textArea.focus();
}

function eraseTextArea() {
    document.getElementById("textArea").value = "";
}

function addLobbyMember(name, number) {
    const table = document.getElementById("lobbyMembers");
    const tr = document.createElement("tr");
    tr.classList.add("player");
    tr.id = "player_" + number;
    const td = document.createElement("td");
    td.innerText = name;
    tr.appendChild(td);
    table.appendChild(tr);
}

//
// Fonctions gérant l'affichage sur le jeu
//

socket.on("loadPlayers", (players, number) => {
    for (let i = 0; i < number; i++) {
        addLobbyMember(players[i], i);
    }
});

socket.on("loadJoiningPlayer", (name, number) => {
    // affichage sur l'écran des joueurs
    addLobbyMember(name, number);
});

// affiche sur le coté les joueurs qui jouent
socket.on("loadParticipatingPlayer", (name, life, number) => {
    const trList = document.getElementsByClassName("player");
    for (let i = 0; i < number; i++) {
        if (trList[i].children[0].innerText === name) {
            trList[i].classList.add("activePlayer", "activePlayer_" + i);
            trList[i].id = "activePlayer" + i;
            const tdLife = document.createElement("td");
            tdLife.innerText = life;
            tdLife.classList.add("life", "life_" + i);
            tdLife.id = "life_" + i;
            const tdWord = document.createElement("td");
            tdWord.innerText = "";
            tdWord.classList.add("word", "word_" + i);
            tdWord.id = "word_" + i;
            trList[i].appendChild(tdLife);
            trList[i].appendChild(tdWord);
        }
    }
});

socket.on("updateTimer", (timeLeft) => {
    // affiche un temps restant avant que la partie se lance avec les joueurs actuels
    const timer = document.getElementById("remainingTime");
    if (timeLeft > 0) {
        timer.innerText = `Temps restant avant lancement automatique ${timeLeft}s`;
    } else {
        timer.style.display = "none";
    }
    
});

socket.on("refresh", (syllable, currentTurn) => {
    reloadSyllableDisplay(syllable);
    //currentPlayerTurn = currentTurn;
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
        if (maxStreak < currentStreak) {
            maxStreak = currentStreak;
        }
        currentStreak = 0;
        showStreak();
        loadScore();
    }
});

socket.on("displayExplosion", (mode, turn) => {
    if (mode === "multi") {
        let life = document.getElementById("life_" + turn);
        life.innerText = parseInt(life.innerText) - 1;
    }
});

socket.on("displayElimination", (turn) => {
    document.getElementById("player_" + turn).classList.add("eliminated");
});

socket.on("defeat", () => {
    // afficher la bannière de défaite et rejouer
    document.getElementById("endBanner").style.display = "block";
    document.getElementById("victoryBanner").innerText = "plus longue série : " + maxStreak;    
});

socket.on("joinNextGame", (winner) => {
    showJoinButton();
    hideTextArea();
    reloadSyllableDisplay("Gagnant : " + winner)
    const timer = document.getElementById("remainingTime");
    timer.innerText = "";
    timer.style.display = "block";
});

//
// Gestion des communications client/serveur
//


socket.on("startTurn", () => {
    showTextArea();
})


// permet de créer l'alphabet bonus permettant de regagner une vie
function createBonusLetters(alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    //
}

function guess(word) {
   // peut être vérifier en local si le mot est valide avant de faire la requete pour vérifier
    socket.emit("guessBombWord", (word, bombGameRoomName));

}

function reloadSyllableDisplay(syllable) {
    document.getElementById("syllableDisplay").innerText = syllable;
}

function hideEndBanner() {
    document.getElementById("endBanner").style.display = "none";
}

function replayButton() {
    let replay = document.getElementById("buttonReplay");
    replay.addEventListener("click", () => {
        hideEndBanner();
        socket.emit("joinBombSolo", bombGameRoomName);
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
        socket.emit("guessBombWord", ({word: text, name: bombGameRoomName}));
        eraseTextArea();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    setButtonJoinGame();
    bombGameRoomName = localStorage.getItem("name");
    if (bombGameRoomName) {
        // mode multi
        socket.emit("joinBombRoom", (bombGameRoomName));
        localStorage.removeItem("name");
    } else {
        // mode solo
        socket.emit("joinBombSolo", (bombGameRoomName));
        hideJoinButton();
        document.getElementById("lobbyMembers").style.display = "none";
        replayButton();
        document.getElementById("scoreBoard").style.display = "block";
        loadScore();
        showStreak();
    }
    

    //document.getElementById("textArea").focus();
});
