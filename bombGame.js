let usedWords = [];
let syllables = ["NS", "ALO", "ES", "TR", "CON", "PO", "AIE", "NT", "IS", "TO", "ER", "EN", "ONI", "ONS", "UR", "MI", "SIO", "NAU", "RIS", "SSE", "ASS", "TS", "SUR", "LAS", "HE", "GO", "SSA", "GN", "ANC", "EZ", "ON"]
let currentSyllable;
let life = 3;
let timer;

function guess(word, syllable) {
    // si le mot à la syllabe et que le mot existe et que le mot est pas deja tape
    console.log(word + ' ' + syllable)
    if (word.includes(syllable) && !usedWords.includes(word)) {
        usedWords.push(word);
        currentSyllable = getRandomSyllable();
        reloadSyllableDisplay(currentSyllable);
        eraseTextArea();
        startOrResetTimer();
    } else {
        life -= 1;
        checkDefeat(life);
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
