const socket = io('https://groupe7-aws.onrender.com');


let currentStreak = 0;
let maxStreak = 0;
let bombGameRoomName;
let currentSyllable = "";
//let currentPlayerTurn;

//
// Création des interfaces et gestions des boutons
//

// permet au bouton rejouer de rejoindre la partie en cours
function setButtonJoinGame() {
    const join = document.getElementById("joinButton");
    join.addEventListener("click", () => {
        if (bombGameRoomName) {
            socket.emit("joinBombGame", (bombGameRoomName));
        } else {
            socket.emit("joinBombSolo", (bombGameRoomName));
        }
        createBonusLetters();
        hideJoinButton();
    });
    
}

socket.on("gameOver", ({ winnerName }) => {
    document.getElementById('winnerDisplay').innerText = `Gagnant : ${winnerName}`;
});


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

// function addLobbyMember(name, number) {
//     const table = document.getElementById("lobbyMembers");
//     const tr = document.createElement("tr");
//     tr.classList.add("player");
//     tr.id = "player_" + number;
//     const td = document.createElement("td");
//     td.innerText = name;
//     tr.appendChild(td);
//     table.appendChild(tr);
// }

function addLobbyMember(name, id) {
    const lobbyList = document.getElementById("lobbyList");
    if (lobbyList) {
        const li = document.createElement("li");
        li.classList.add("player");
        li.id = `player_${id}`;
        li.innerText = name;
        lobbyList.appendChild(li);
    } else {
        console.error("Erreur : lobbyList introuvable !");
    }
}



//
// Fonctions gérant l'affichage sur le jeu
//

// socket.on("loadPlayers", (players, number) => {
//     for (let i = 0; i < number; i++) {
//         addLobbyMember(players[i], i);
//     }
// });

// socket.on("loadJoiningPlayer", (name, number) => {
//     // affichage sur l'écran des joueurs
//     addLobbyMember(name, number);
// });

// Chargement des joueurs avec pseudo clairement affichés
// socket.on("loadPlayers", (players) => {
//     players.forEach((player, index) => {
//         addLobbyMember(player.name, player.id || index);
//     });
// });
socket.on("loadPlayers", (players) => {
    players.forEach(player => {
        addLobbyMember(player.name, player.id);
    });
});
// Lorsqu'un nouveau joueur rejoint, l'afficher clairement :
socket.on("loadJoiningPlayer", ({ id, name }) => {
    addLobbyMember(name, id);
});


// affiche sur le coté les joueurs qui jouent
// socket.on("loadParticipatingPlayer", (name, life, number) => {
//     const trList = document.getElementsByClassName("player");
//     for (let i = 0; i < number; i++) {
//         if (trList[i].children[0].innerText === name) {
//             trList[i].classList.add("activePlayer", "activePlayer_" + i);
//             trList[i].id = "activePlayer" + i;
//             const tdLife = document.createElement("td");
//             tdLife.innerText = life;
//             tdLife.classList.add("life", "life_" + i);
//             tdLife.id = "life_" + i;
//             const tdWord = document.createElement("td");
//             tdWord.innerText = "";
//             tdWord.classList.add("word", "word_" + i);
//             tdWord.id = "word_" + i;
//             trList[i].appendChild(tdLife);
//             trList[i].appendChild(tdWord);
//         }
//     }
// });

// affiche clairement les joueurs actifs sur le côté
// socket.on("loadParticipatingPlayer", ({ id, name, life }) => {
//     const trList = document.getElementsByClassName("player");

//     for (let i = 0; i < trList.length; i++) {
//         if (trList[i].children[0].innerText === name) {
//             trList[i].classList.add("activePlayer", `activePlayer_${id}`);
//             trList[i].id = `activePlayer${id}`;

//             const tdLife = document.createElement("td");
//             tdLife.innerText = life;
//             tdLife.classList.add("life", `life_${id}`);
//             tdLife.id = `life_${id}`;

//             const tdWord = document.createElement("td");
//             tdWord.innerText = "";
//             tdWord.classList.add("word", `word_${id}`);
//             tdWord.id = `word_${id}`;

//             trList[i].appendChild(tdLife);
//             trList[i].appendChild(tdWord);
//         }
//     }

//     // Affichage sous forme de cartes visuelles (comme ton screenshot)
//     const playersDisplay = document.getElementById('playersDisplay');

//     let playerCard = document.createElement('div');
//     playerCard.classList.add('player-card');
//     playerCard.id = `player-${id}`;

//     playerCard.innerHTML = `
//         <div class="player-name">${name}</div>
//         <div class="player-lives">❤️ ${life}</div>
//         <div class="player-word" id="word-${id}"></div>
//     `;
//     playersDisplay.appendChild(playerCard);
// });

socket.on("loadParticipatingPlayer", ({ id, name, life }) => {
    const trList = document.getElementsByClassName("player");

    for (let i = 0; i < trList.length; i++) {
        const firstChild = trList[i].children[0]; 
        if (firstChild && firstChild.innerText === name) {
            trList[i].classList.add("activePlayer", `activePlayer_${id}`);
            trList[i].id = `activePlayer${id}`;

            const tdLife = document.createElement("td");
            tdLife.innerText = life;
            tdLife.classList.add("life", `life_${id}`);
            tdLife.id = `life_${id}`;

            const tdWord = document.createElement("td");
            tdWord.innerText = "";
            tdWord.classList.add("word", `word_${id}`);
            tdWord.id = `word_${id}`;

            trList[i].appendChild(tdLife);
            trList[i].appendChild(tdWord);
        }
    }

    // Vérifier si l'affichage sous forme de cartes existe avant d'ajouter
    const playersDisplay = document.getElementById('playersDisplay');
    if (playersDisplay) {
        let playerCard = document.createElement('div');
        playerCard.classList.add('player-card');
        playerCard.id = `player-${id}`;

        playerCard.innerHTML = `
            <div class="player-name">${name}</div>
            <div class="player-lives">❤️ ${life}</div>
            <div class="player-word" id="word-${id}"></div>
        `;
        playersDisplay.appendChild(playerCard);
    } else {
        console.warn("playersDisplay n'existe pas dans ce contexte.");
    }
});


// affiche clairement le mot que chaque joueur tape
// socket.on("updateCurrentWord", ({ playerId, word }) => {
//     // Met à jour l'affichage sous forme de cartes
//     const wordDisplay = document.getElementById(`word-${playerId}`);
//     if (wordDisplay) wordDisplay.innerText = word;

//     // Met à jour l'affichage en tableau
//     const tdWord = document.getElementById(`word_${playerId}`);
//     if (tdWord) tdWord.innerText = word;
// });
socket.on("updateCurrentWord", ({playerId, word}) => {
    let wordDisplay = document.getElementById(`word_${playerId}`);
    if (!wordDisplay) {
        // Si l'élément n'existe pas, on le crée immédiatement
        const playersDisplay = document.getElementById('playersDisplay');
        if (!playersDisplay) {
            console.error("playersDisplay non trouvé dans HTML !");
            return;
        }

        const playerCard = document.createElement('div');
        playerCard.id = `player_${playerId}`;
        playerCard.classList.add('player-card');

        wordDisplay = document.createElement('div');
        wordDisplay.id = `word_${playerId}`;
        wordDisplay.classList.add('player-word');

        playerCard.appendChild(wordDisplay);
        playersDisplay.appendChild(playerCard);
    }
    wordDisplay.innerText = word;
});


// socket.on("updateTimer", (timeLeft) => {
//     // affiche un temps restant avant que la partie se lance avec les joueurs actuels
//     const timer = document.getElementById("remainingTime");
//     if (timeLeft > 0) {
//         timer.innerText = `Temps restant avant lancement automatique ${timeLeft}s`;
//     } else {
//         timer.style.display = "none";
//     }
    
// });

socket.on("updateTimer", (timeLeft) => {
    const timer = document.getElementById("remainingTime");
    if (!timer) {
        console.warn("Erreur : l'élément 'remainingTime' n'existe pas dans ton HTML !");
        return;
    }
    timer.innerText = `Temps restant : ${timeLeft}s`;
});


// socket.on("refresh", (syllable, currentTurn) => {
//     reloadSyllableDisplay(syllable);
//     //currentPlayerTurn = currentTurn;
// });
socket.on("refresh", ({ syllable, currentTurn }) => {
    reloadSyllableDisplay(syllable);

    // mise à jour cartes visuelles
    document.querySelectorAll('.player-card').forEach(card => card.classList.remove('current-turn'));
    const currentPlayerCard = document.getElementById(`player-${currentTurn}`);
    if (currentPlayerCard) currentPlayerCard.classList.add('current-turn');

    // mise à jour tableau
    document.querySelectorAll('.activePlayer').forEach(player => player.classList.remove('current-turn'));
    const currentPlayerRow = document.getElementById(`activePlayer${currentTurn}`);
    if (currentPlayerRow) currentPlayerRow.classList.add('current-turn');
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

socket.on("disconnected", (player) => {
    const table = document.getElementById("lobbyMembers");
    Array.from(table.children).forEach(tr => {
        if (tr.innerText === player) {
            tr.remove();
        }
    });
});

//
// Gestion des communications client/serveur
//


socket.on("startTurn", () => {
    showTextArea();
})


// permet de créer l'alphabet bonus permettant de regagner une vie
function createBonusLetters(alphabet = "ABCDEFGHIJLMNOPQRSTUV") {
    const table = document.getElementById("bonusLetters");
    table.innerHTML = "";
    const tr1 = document.createElement("tr");
    const tr2 = document.createElement("tr");
    for (let i = 0; i < alphabet.length; i++) {
        const td = document.createElement("td");
        td.classList.add("unguessed");
        td.id = alphabet[i];
        td.innerText = alphabet[i];
        if (i < Math.ceil(alphabet.length / 2)) {
            tr1.appendChild(td);
        } else {
            tr2.appendChild(td);
        }
    }
    table.appendChild(tr1);
    table.appendChild(tr2);
}

function guess(word) {
   // peut être vérifier en local si le mot est valide avant de faire la requete pour vérifier
    socket.emit("guessBombWord", (word, bombGameRoomName));

}

function reloadSyllableDisplay(syllable) {
    document.getElementById("syllableDisplay").innerText = syllable;
    currentSyllable = syllable;
}

function hideEndBanner() {
    document.getElementById("endBanner").style.display = "none";
}

function replayButton() {
    let replay = document.getElementById("buttonReplay");
    if (replay) {
        replay.addEventListener("click", () => {
            hideEndBanner();
            socket.emit("joinBombSolo", bombGameRoomName);
        });
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
        document.getElementById("lobbyMembers").style.display = "none";
        replayButton();
        document.getElementById("scoreBoard").style.display = "block";
        loadScore();
        showStreak();
    }
});

document.getElementById("backButton").addEventListener("click", () => {
    goBackToGames(); 
});

function goBackToGames() {
    window.location.href = "games.html";
}