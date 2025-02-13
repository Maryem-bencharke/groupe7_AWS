let life = 10;
let wordToGuess = "";
let lettersTyped = [];

function guess(letterGuessed) {
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

        if (life < 1) {
            // Défaite
            defeat();
            console.log("défaite");
        }
    }
}

function createKeyboard() {
    let keyboard = document.getElementById('keyboard');
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    for (let letter of alphabet) {
        let button = document.createElement("button");
        button.innerText = letter;
        button.id = letter;
        button.classList.add("letter");
        button.onclick = function () {guess(letter)};
        keyboard.appendChild(button);
    }   
}

function initWord() {
    // il faudra prendre un mot aléatoire depuis la base de donnée
    wordToGuess = "BONJOUR".toUpperCase();
    document.getElementById("word-display").innerText = "_ ".repeat(wordToGuess.length);
}

function victory() {
    document.getElementById("victoryBanner").style.display = "block";
    blockKeyboard();    
}

function defeat() {
    let banner = document.getElementById("victoryBanner");
    banner.innerText = "Défaite";
    banner.style.display = "block";
    blockKeyboard();
}

function blockKeyboard() {
    let buttons = document.getElementsByClassName("letter");
    for (let button of buttons) {
        button.disabled = true;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initWord();
    createKeyboard();
  });