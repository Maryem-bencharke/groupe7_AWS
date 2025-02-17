let life = 6;
let wordToGuess = "";
let lettersTyped = [];
let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
let keyboardEventHandler = (event) => {
    event.preventDefault();
    // potentiellement rajouter un parser pour les accents au clavier
    if (alphabet.includes(event.key.toUpperCase())) {
        guess(event.key.toUpperCase());
    }
}

function guess(letterGuessed) {
    if (!lettersTyped.includes(letterGuessed)) {
        lettersTyped.push(letterGuessed);
        document.getElementById(letterGuessed).disabled = true;
        if (wordToGuess.includes(letterGuessed)) {
            let display = document.getElementById("word-display");
            let text = display.innerText.split(" ");
            for (let index in wordToGuess) {
                if (wordToGuess[index] === letterGuessed) {
                    text[index] = letterGuessed;
                }
            }
            text = text.join(" ");
            display.innerText = text;
            if (!text.includes("_")) {
                // Victoire
                victory();
                console.log("victoire");
            }
        } else {
            life -= 1;
            // affichage dans le canvas du pendu
            drawHangman(life);
            if (life < 1) {
                // Défaite
                defeat();
                console.log("défaite");
            }
        }
    }
}

function createVirtualKeyboard() {
    let Virtualkeyboard = document.getElementById('keyboard');
    for (let letter of alphabet) {
        let button = document.createElement("button");
        button.innerText = letter;
        button.id = letter;
        button.classList.add("letter");
        button.onclick = function () {guess(letter)};
        Virtualkeyboard.appendChild(button);
    }   
}

function addKeyboardEvent() {
    document.addEventListener("keydown", keyboardEventHandler);
}

function removeKeyboardEvent() {
    document.removeEventListener("keydown", keyboardEventHandler);
}

function initWord() {
    // il faudra prendre un mot aléatoire depuis la base de donnée
    wordToGuess = "BONJOUR".toUpperCase();
    document.getElementById("word-display").innerText = "_ ".repeat(wordToGuess.length);
}

function victory() {
    document.getElementById("endBanner").style.display = "block";
    let text = document.getElementById("victoryBanner");
    text.innerText = "Victoire";
    blockVirtualKeyboard();
    removeKeyboardEvent();
}

function defeat() {
    document.getElementById("endBanner").style.display = "block";
    let text = document.getElementById("victoryBanner");
    text.innerText = "Défaite";
    blockVirtualKeyboard();
    removeKeyboardEvent();
}

function hideEndBanner() {
    document.getElementById("endBanner").style.display = "none";
}

function blockVirtualKeyboard() {
    let buttons = document.getElementsByClassName("letter");
    for (let button of buttons) {
        button.disabled = true;
    }
}

function activateVirtualKeyboard() {
    let buttons = document.getElementsByClassName("letter");
    for (let button of buttons) {
        button.disabled = false;
    }
}

function drawHangman(step) {
    const canvas = document.getElementById("hangmanCanvas");
    switch (step) {
        case 5 : // tête
            break;
        case 4 : // corps
            break;
        case 3 : // bras gauche
            break;
        case 2 : // bras droit
            break;
        case 1 : // jambe gauche
            break;
        case 0 : // jambe droite + X_X
            break;
    }

}

function clearHangman() {
    const canvas = document.getElementById("hangmanCanvas");
    // remettre à 0 le canvas
}

function replayButton() {
    let replay = document.getElementById("buttonReplay");
    replay.addEventListener("click", () => {
        initWord();
        activateVirtualKeyboard();
        addKeyboardEvent();
        hideEndBanner();
        life = 6;
        lettersTyped = [];
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initWord();
    createVirtualKeyboard();
    addKeyboardEvent();
    replayButton();
  });