let life = 10;
let wordToGuess = "bonjour";
let lettersTyped = [];

function guess(letterGuessed) {
    console.log("Bouton cliquer : " + letterGuessed)
    if (letterGuessed in lettersTyped) {
        // afficher un message pour dire que la lettre a deja été tenter
        // ou alors bloquer cette lettre
    } else {
        lettersTyped.push(letterGuessed);
        // bloquer la lettre
    }
    if (wordToGuess.includes(letterGuessed)) {
        for (letter in wordToGuess) {
            if (letter = letterGuessed) {
                // afficher sur le canvas + mettre à jour une var pour la victoire
            }
        }
    } else {
        life -= 1;
    }
}
document.getElementById('A').onclick = function () {
    guess("a");
};  