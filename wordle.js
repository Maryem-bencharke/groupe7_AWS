const targetWord = "CRANE"; // Mot fixe à deviner
const maxAttempts = 6;
let currentAttempt = 0;
let currentGuess = "";

// Écouteur pour le clavier de l'ordi
document.addEventListener("keydown", (event) => {
    const key = event.key.toUpperCase();

    if (key === "ENTER") {
        event.preventDefault(); 
        if (currentGuess.length === 5) {
            checkWord();
        }
    } else if (key === "BACKSPACE" && currentGuess.length > 0) {
        currentGuess = currentGuess.slice(0, -1);
        updateGrid();
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
        currentGuess += key;
        updateGrid();
    }
});

// Écouteur pour le clavier sur le site
document.querySelectorAll(".keyboard button").forEach(button => {
    button.addEventListener("click", () => {
        const key = button.dataset.key;

        if (key === "Backspace" && currentGuess.length > 0) {
            currentGuess = currentGuess.slice(0, -1);
        } else if (key === "Enter" && currentGuess.length === 5) {
            checkWord();
        } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
            currentGuess += key;
        }

        updateGrid();
    });
});

// Met à jour l'affichage de la grille
function updateGrid() {
    for (let i = 0; i < 5; i++) {
        const cell = document.getElementById(`cell-${currentAttempt}-${i}`);
        cell.textContent = currentGuess[i] || ""; 
    }
}

// verification et l'affichage des cases avec les couleurs 
function checkWord() {
    if (currentGuess.length !== 5) return;

    for (let i = 0; i < 5; i++) {
        const cell = document.getElementById(`cell-${currentAttempt}-${i}`);
        const letter = currentGuess[i];

        if (letter === targetWord[i]) {
            cell.style.backgroundColor = "green"; 
        } else if (targetWord.includes(letter)) {
            cell.style.backgroundColor = "orange"; 
        } else {
            cell.style.backgroundColor = "grey"; 
        }
    }

    if (currentGuess === targetWord) {
        setTimeout(() => alert("Bravo, vous avez trouvé le mot !"), 100);
        return;
    }

    currentAttempt++;
    currentGuess = "";

    if (currentAttempt >= maxAttempts) {
        setTimeout(() => alert(`Dommage ! Le mot était : ${targetWord}`), 100);
    }
}
