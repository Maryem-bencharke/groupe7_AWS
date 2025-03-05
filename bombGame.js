let usedWords = [];
let syllables = ["NS", "ALO", "ES", "TR", "CON", "PO", "AIE", "NT", "IS", "TO", "ER", "EN", "ONI", "ONS", "UR", "MI", "SIO", "NAU", "RIS", "SSE", "ASS", "TS", "SUR", "LAS", "HE", "GO", "SSA", "GN", "ANC", "EZ", "ON"]
let currentSyllable;
let life = 3;
let timer;

async function guess(word, syllable) {
    // si le mot à la syllabe et que le mot existe et que le mot est pas deja tape
    if (word.includes(syllable) && !usedWords.includes(word) && await checkWord(word)) {
        usedWords.push(word);
        currentSyllable = getRandomSyllable();
        reloadSyllableDisplay(currentSyllable);
        eraseTextArea();
        startOrResetTimer();
    } else {
        eraseTextArea();
    }
}

function getRandomSyllable() {
    return syllables[~~(Math.random() * syllables.length)];
}

function checkDefeat(life) {
    if (life < 1) {
        document.getElementById("endBanner").style.display = "block";
        let text = document.getElementById("victoryBanner");
        text.innerText = "Défaite";
        document.getElementById("textArea").display = "none";
        clearTimeout(timer);
    }
}

function reloadSyllableDisplay(syllable) {
    document.getElementById("syllableDisplay").innerText = syllable;
}

function eraseTextArea() {
    document.getElementById("textArea").value = "";
}

function startOrResetTimer() {
    if (timer) {
        clearTimeout(timer);
    }
    timer = setTimeout(guessTimeout, 5000);
}

function guessTimeout() {
    life -= 1;
    checkDefeat(life);
    currentSyllable = getRandomSyllable();
    reloadSyllableDisplay(currentSyllable);
    eraseTextArea();
    startOrResetTimer();
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


document.addEventListener("keydown", (event) => {
    const key = event.key.toUpperCase();
    if (key === "ENTER") {
        const text = document.getElementById("textArea").value.toUpperCase();
        const syllable = document.getElementById("syllableDisplay").innerText;
        guess(text, syllable);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    currentSyllable = getRandomSyllable();
    reloadSyllableDisplay(currentSyllable);
    startOrResetTimer();
    replayButton();
    document.getElementById("textArea").focus();
});
