const socket = io('https://groupe7-aws.onrender.com');

let targetWordLenght = 0;
let life = 6;
let currentGuess = "";
let roomName;

//Mise à jour de la grille
function updateGrid() {
    for (let i = targetWordLenght - 1; i >= 0; i--) {
        const cell = document.getElementById(`cell-${life - 1}-${i}`);
        if (cell) {
            cell.textContent = currentGuess[i] || "";
        }
    }
}

//Gestion du clavier virtuel
function addVirtualKeyboardEvent() {
    document.querySelectorAll(".keyboard button").forEach(button => {
        button.disabled = false;
    });
}

function blockVirtualKeyboardEvent() {
    document.querySelectorAll(".keyboard button").forEach(button => {
        button.disabled = true;
    });
}

document.querySelectorAll(".keyboard button").forEach(button => {
    button.addEventListener("click", () => {
        const key = button.dataset.key;
        if (key === "Backspace" && currentGuess.length > 0) {
            currentGuess = currentGuess.slice(0, -1);
            updateGrid();
        } else if (key === "Enter" && currentGuess.length === targetWordLenght) {
            socket.emit("guessWord", { name: roomName, wordGuessed: currentGuess });
            currentGuess = "";
        } else if (/^[A-Z]$/.test(key) && currentGuess.length < targetWordLenght) {
            currentGuess += key;
            updateGrid();
        }
        
        
    });
});

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

//Gestion des entrées clavier physique
function keyboardEventHandler(event) {
    const key = event.key.toUpperCase();
    
    if (key === "ENTER") {
        event.preventDefault();
        if (currentGuess.length === targetWordLenght) {
            socket.emit("guessWord", { name: roomName, wordGuessed: currentGuess });
            currentGuess = "";
        }
    } else if (key === "BACKSPACE" && currentGuess.length > 0) {
        currentGuess = currentGuess.slice(0, -1);
        updateGrid();
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < targetWordLenght) {
        currentGuess += key;
        updateGrid();
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

function hideChoosenWordDisplay() {
    const word = document.getElementById("choosenWord");
    word.style = "display: none";
}

//Création de la grille de jeu
function createGrid(wordLength) {
    const gridContainer = document.getElementById("grid");
    gridContainer.innerHTML = "";

    for (let attempt = life - 1; attempt >= 0; attempt--) {
        const row = document.createElement("div");
        row.classList.add("row");

        for (let i = 0; i < wordLength; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.id = `cell-${attempt}-${i}`;
            row.appendChild(cell);
        }

        gridContainer.appendChild(row);
    }
}

function resetKeyboardColors() {
    document.querySelectorAll(`button[data-key]`).forEach(button => {
        button.style.backgroundColor = "grey";
    });
}

function hideEndBanner() {
    document.getElementById("endBanner").style.display = "none";
}

function replayButton() {
    let replay = document.getElementById("buttonReplay");
    replay.addEventListener("click", () => {
        addKeyboardEvent();
        hideEndBanner();
        socket.emit("getRandomWord");
    });
}

// affichage après avoir envoyé et reçu son mot
socket.on("startGuessing", (word) => {
    document.getElementById("gameContainer").style = "display: block";
    addKeyboardEvent();
    addVirtualKeyboardEvent();
    targetWordLenght = word.length / 2;
    createGrid(word.length / 2); // on divise par 2 car word c'est '_ _ _ '
});

socket.on("guessResult", ({result, remainingLife}) => {
    life = remainingLife;
    let i = 0;
    for ([letter, color] of result) {
        // on change les couleurs des boutons du claviers
        document.querySelectorAll(`button[data-key="${letter}"]`).forEach(button => {
            if (button.style.backgroundColor != "green") {
                button.style.backgroundColor = color;   
            }
        });
        // on change les couleurs dans le guess
        const cell = document.getElementById(`cell-${remainingLife}-${i}`);
        cell.style.backgroundColor = color;
        i += 1;
    }
    updateGrid();
});

socket.on("stopGuessing", (msg) => {
    blockVirtualKeyboardEvent();
    removeKeyboardEvent();
    alert(msg);
})

socket.on("gameResult", (msg) => {
    life = 6;
    resetKeyboardColors();
    showChoosenWordDisplay();
    alert(msg);
    addChooseWordEvent();
    document.getElementById("grid").innerHTML = ""; // efface la grid
    document.getElementById("gameContainer").style.display = "none";
});

socket.on("soloGameResult", (msg) => {
    life = 6;
    resetKeyboardColors();
    blockVirtualKeyboardEvent();
    removeKeyboardEvent();
    document.getElementById("grid").innerHTML = ""; // efface la grid
    document.getElementById("endBanner").style.display = "block";
    document.getElementById("victoryBanner").innerText = msg;
});

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
