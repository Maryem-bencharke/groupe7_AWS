//var socket = io('https://groupe7-aws.onrender.com');
const socket = io("http://127.0.0.1:3000");
let currentStreak = 0;
let maxStreak = 0;
let soloLife = 2; // Nombre de vies en mode solo
let bombGameRoomName;
let currentSyllable = "";
let db;
let roomName;

function waitForUsername(callback) {
    const check = () => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            callback(storedUsername);
        } else {
            setTimeout(check, 100); // Attend que Firebase ait rempli le username
        }
    };
    check();
}

document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem('username') || `Guest${Math.floor(Math.random() * 10000)}`;
    socket.emit("setUsername", username);
});


// permet au bouton rejouer de rejoindre la partie de bombGame
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

// Cache le bouton pour rejoindre la partie.
function hideJoinButton() {
    const join = document.getElementById("joinButton");
    join.style.display = "none";
}

// Affiche le bouton pour rejoindre la partie.
function showJoinButton() {
    const join = document.getElementById("joinButton");
    join.style.display = "block";
}

// Cache l'input pour écrire le mot.
function hideTextArea() {
    const textArea = document.getElementById("textArea");
    textArea.style.display = "none";
}

// Affiche l'input pour écrire le mot.
function showTextArea() {
    const textArea = document.getElementById("textArea");
    textArea.style.display = "block";
    textArea.focus();
}

// Éfface l'input.
function eraseTextArea() {
    document.getElementById("textArea").value = "";
}

// représentant une personne qui se connecte à la salle.
function addLobbyMember(name, id) {
    const lobbyList = document.getElementById("lobbyList");
    if (lobbyList && !document.getElementById(`player_${id}`)) {
        const li = document.createElement("li");
        li.classList.add("player");
        li.id = `player_${id}`;
        li.innerText = name;
        lobbyList.appendChild(li);
    }
}

socket.on("loadPlayers", (players) => {
    document.getElementById('lobbyList').innerHTML = "";
    players.forEach(player => {
        addLobbyMember(player.name, player.id);
    });
});

socket.on("loadJoiningPlayer", (name, number) => {
    addLobbyMember(name, number);
});


function addParticipatingLobbyPlayer(id, name, life) {
    // mise à jour carte joueur
    const playersDisplay = document.getElementById('playersDisplay');
    if (playersDisplay && !document.getElementById(`player-${id}`)) {
        let playerCard = document.createElement('div');
        playerCard.classList.add('player-card');
        playerCard.id = `player-${id}`;

        playerCard.innerHTML = `
            <div class="player-name">${name}</div>
            <div class="player-lives" id="card-life-${id}">❤️ ${life}</div>
            <div class="player-word" id="word-${id}"></div>
        `;
        playersDisplay.appendChild(playerCard);
    } else {
        let playerCard = document.getElementById(`player-${id}`);
        playerCard.innerHTML = `
            <div class="player-name">${name}</div>
            <div class="player-lives" id="card-life-${id}">❤️ ${life}</div>
            <div class="player-word" id="word-${id}"></div>
        `;
    }
}

socket.on("loadParticipatingPlayers", (room) => {
    document.getElementById('playersDisplay').innerHTML = "";
    room.activePlayers.forEach(player => {
        let id = player.id;
        let name = room.players.find(p => p.id === id);
        let life = player.life;
        addParticipatingLobbyPlayer(id, name.name, life);
    });
});

socket.on("loadJoiningParticipatingPlayer", ({id, name, life}) => {
    addParticipatingLobbyPlayer(id, name, life);
});

socket.on("clearActivePlayers", () => {
    document.getElementById('playersDisplay').innerHTML = "";
});

socket.on("updateCurrentWord", ({playerId, word}) => {
    // let wordDisplay = document.getElementById(`word_${playerId}`);
    let wordDisplay = document.getElementById(`word-${playerId}`);

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
        wordDisplay.id = `word-${playerId}`;
        wordDisplay.classList.add('player-word');

        playerCard.appendChild(wordDisplay);
        playersDisplay.appendChild(playerCard);
    }
    wordDisplay.innerText = word;
});




socket.on("updateTimer", (timeLeft) => {
    const timer = document.getElementById("remainingTime");
    timer.innerText = `Temps restant : ${timeLeft}s`;
    if (timeLeft === 0) {
        timer.style.display = "none";
    } else {
        timer.style.display = "block";
    }
});

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


socket.on("validate", (mode, bonnusLetters) => {
    if (mode === "multi") {
        hideTextArea();
    } else {
        currentStreak += 1;
        showStreak();
    }
    createBonusLetters(bonnusLetters);
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
        let lifeEl = document.getElementById("life_" + turn);
        if (lifeEl) {
            const currentLife = parseInt(lifeEl.innerText.match(/\d+/)[0]);
            if (!isNaN(currentLife)) {
                lifeEl.innerText = ` ❤️ ${currentLife - 1}`;
            }
        }

        let cardLife = document.getElementById("card-life-" + turn);
        if (cardLife) {
            const currentCardLife = parseInt(cardLife.innerText.match(/\d+/)[0]);
            if (!isNaN(currentCardLife)) {
                cardLife.innerText = `❤️ ${currentCardLife - 1}`;
            }
        }
    }
});

socket.on("defeat", () => {
    // afficher la bannière de défaite et rejouer
    document.getElementById("endBanner").style.display = "block";
    document.getElementById("victoryBanner").innerText = "plus longue série : " + maxStreak;    
});
socket.on("updateSoloLife", (life) => {
    soloLife = life;
    document.getElementById("soloLifeDisplay").innerText = `❤️ Vies : ${soloLife}`;
});


socket.on("joinNextGame", () => {
    showJoinButton();
    hideTextArea();
    document.getElementById("syllableDisplay").innerText = "";
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

socket.on("gameAlreadyStarted", () => {
    hideJoinButton();
});

socket.on("waitingToLaunch", () => {
    document.getElementById('winnerDisplay').innerText = "";
});

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

async function guess(word) {
    if (word.includes(currentSyllable) && await isWordInIndexedDB(word)) {
        socket.emit("guessBombWord", word, bombGameRoomName);
    }

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
            soloLife = 2; // Remet le nombre de vies à 2
            document.getElementById("soloLifeDisplay").innerText = `❤️ Vies : ${soloLife}`;
            socket.emit("joinBombSolo", bombGameRoomName);
            createBonusLetters();
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
        guess(text);
        eraseTextArea();
    }
});

// Récupère la liste de mot depuis le serveur.
async function loadServerFile() {
    try {
        const response = await fetch("wordList.txt");
        if (!response.ok) throw new Error("Erreur de chargement du fichier.");
        const text = await response.text();
        const wordsArray = text.split("\n").map(w => w.trim()).filter(w => w !== "");
        await saveToIndexedDB(wordsArray);
    } catch (error) {
        console.error("Erreur lors du chargement :", error);
    }
}

// Stocke chaque mot dans IndexedDB avec sa taille
async function saveToIndexedDB(wordsArray) {
    const db = await initIndexedDB();
    const transaction = db.transaction(["words"], "readwrite");
    const store = transaction.objectStore("words");
    wordsArray.forEach(word => {
        store.put({ word: word, length: word.length });
    });
    transaction.oncomplete = () => alert("Chargement terminé, merci d'avoir patienté");
    transaction.onerror = event => console.error("Erreur d'ajout", event.target.error);
}

// Initialise la base de données des mots.
function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("WordDatabase", 1);
        request.onupgradeneeded = function(event) {
            let db = event.target.result;
            if (!db.objectStoreNames.contains("words")) {
                db.createObjectStore("words", { keyPath: "word" });
            }
        };
        request.onsuccess = function(event) {
            db = event.target.result;
            resolve(db);
        };
        request.onerror = function(event) {
            reject("Erreur IndexedDB: " + event.target.errorCode);
        };
    });
}

// Vérifie si la base de données est vide.
async function isIndexedDBEmpty() {
    const db = await initIndexedDB();
    return new Promise((resolve) => {
        const transaction = db.transaction(["words"], "readonly");
        const store = transaction.objectStore("words");
        const request = store.count();
        request.onsuccess = function() {
            resolve(request.result === 0); // True si vide, False sinon
        };
        request.onerror = function() {
            resolve(true);
        };
    });
}

async function isWordInIndexedDB(word) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["words"], "readonly");
        const store = transaction.objectStore("words");
        const request = store.get(word);
        request.onsuccess = function() {
            resolve(request.result !== undefined);
        };
        request.onerror = function() {
            reject("Erreur lors de la recherche du mot !");
        };
    });
}


document.addEventListener("DOMContentLoaded", async () => {
    const isEmpty = await isIndexedDBEmpty();
    if (isEmpty) {
        alert("Chargement de la base de données, cela peut prendre quelques instants");
        loadServerFile();
    }
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
        document.getElementById("soloLifeDisplay").innerText = `❤️ Vies : ${soloLife}`;

    }
});

document.getElementById("backButton").addEventListener("click", () => {
    goBackToGames(); 
});

function goBackToGames() {
    window.location.href = "games.html";
}