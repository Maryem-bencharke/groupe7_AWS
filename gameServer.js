//import { collection, query, where, getDocs} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
//import { db } from "./firebase-config.js";

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { text } = require("stream/consumers");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let wordsNumber = 4000;
let waitingPlayer = null;
let publicRooms = {};
let privateRooms = {};
let penduPlayers = new Set();
let wordlePlayers = new Set();
let bombPlayers = new Set();

io.on("connection", (socket) => {
    console.log(`Un joueur s'est connecté : ${socket.id}`);

    socket.emit("roomList", publicRooms);

    socket.on("createRoom", ({name, game}) => {
        publicRooms[name] = {
            players: [],
            game: game,
        };
        socket.join(name);
        io.emit("roomList", publicRooms);        
    });

    socket.on("joinRoom", (name) => {
        console.log("room : " + name + " connecter avec : " + socket.id);
        publicRooms[name].players.push(socket.id);
        if (!publicRooms[name].life) {
            publicRooms[name].life = {};
        }
        publicRooms[name].life[socket.id] = 6;
        socket.join(name);
        if (publicRooms[name].players.length === 2) {
            io.to(name).emit("chooseWords", "Choisissez un mot pour l'adversaire");
        }
    });

    socket.on("wordChoosen", ({name, word}) => {
        if (!publicRooms[name].words) {
            publicRooms[name].words = {};
        }
        publicRooms[name].words[socket.id] = word;

        if (Object.keys(publicRooms[name].words).length === 2) {
            const players = Object.keys(publicRooms[name].words);
            const word1 = publicRooms[name].words[players[0]];
            const word2 = publicRooms[name].words[players[1]];
            io.to(players[0]).emit("startGuessing", "_ ".repeat(word2.length));
            io.to(players[1]).emit("startGuessing", "_ ".repeat(word1.length));
        }
    });

    socket.on("guessLetter", ({name, letter}) => {
        if (name) {
            const players = Object.keys(publicRooms[name].words);
            if (players[0] === socket.id) {
            guessLetter(letter, publicRooms[name].words[players[1]], players[0]);
        } else {
            guessLetter(letter, publicRooms[name].words[players[0]], players[1]);
        }
        } else {
            // mode solo
            guessLetter(letter, privateRooms[socket.id], socket.id);
        }
    });

    socket.on("gameResult", ({name, life}) => {
        //
        // cas temporaire lifeP il faut gérer les vies du pendu ici
        // pour le moment c'est pas le cas donc problème
        //
        if (!publicRooms[name].lifeP) {
            publicRooms[name].lifeP = {};
        }
        publicRooms[name].lifeP[socket.id] = life;

        if (Object.keys(publicRooms[name].lifeP).length === 2) {
            const players = Object.keys(publicRooms[name].life);
            const player1Life = publicRooms[name].lifeP[players[0]];
            const player2Life = publicRooms[name].lifeP[players[1]];
            if (player1Life > player2Life) {
                io.to(players[0]).emit("victory", "Vous avez gagné avec moins de tentatives que l'adversaire");
                io.to(players[1]).emit("defeat", "Vous avez perdu");
            } else if (player1Life < player2Life) {
                io.to(players[1]).emit("victory", "Vous avez gagné avec moins de tentatives que l'adversaire");
                io.to(players[0]).emit("defeat", "Vous avez perdu");
            } else {
                io.to(players[0]).emit("even", "Égalité, vous avez eu le même score que l'adverdaire");
                io.to(players[1]).emit("even", "Égalité, vous avez eu le même score que l'adverdaire");
            }
            publicRooms[name].words = {};
            publicRooms[name].lifeP = {};
        }
    });

    socket.on("getRandomWord", () => {
        const word = getRandomWordTest();
        privateRooms[socket.id] = word;
        io.to(socket.id).emit("startGuessing", "_ ".repeat(word.length));
    })

    socket.on("disconnect", () => {
        console.log(`Un joueur s'est déconnecté : ${socket.id}`);
        if (privateRooms[socket.id]) {
            delete privateRooms[socket.id];
        } else {
            Object.keys(publicRooms).forEach(room => {
                if (publicRooms[room] && publicRooms[room].players.includes(socket.id)) {
                    publicRooms[room].players = publicRooms[room].players.filter(id => id !== socket.id);
                    if (publicRooms[room].players.length === 0) {
                        delete publicRooms[room];
                    } else {
                        io.to(room).emit("victory", "L'adversaire s'est déconnecté.");
                    }
                }
            });
        }
    });


    // pour wordle
    socket.on("guessWord", ({name, wordGuessed}) => {
        if (name) {
            const players = Object.keys(publicRooms[name].words);
            if (!publicRooms[name].win) {
                publicRooms[name].win = {};
            }
            let result, remainingLife, win;
            if (players[0] === socket.id) {
                ({result, remainingLife, win} = guessWord(wordGuessed, publicRooms[name].words[players[1]], publicRooms[name].life[players[0]]));
                if (win == 2) {
                    publicRooms[name].life[players[0]] = remainingLife;
                } else {
                    publicRooms[name].win[players[0]] = win;
                    io.to(socket.id).emit("stopGuessing", "en attente de l'adversaire");
                }
            } else {
                ({result, remainingLife, win} = guessWord(wordGuessed, publicRooms[name].words[players[0]], publicRooms[name].life[players[1]]));
            
                if (win == 2) {
                    publicRooms[name].life[players[1]] = remainingLife;
                } else {
                    publicRooms[name].win[players[1]] = win;
                    io.to(socket.id).emit("stopGuessing", "en attente de l'adversaire");
                }
            
            }
            io.to(socket.id).emit("guessResult", ({result, remainingLife}));
            if (Object.keys(publicRooms[name].win).length === 2) {
                const players = Object.keys(publicRooms[name].win);
                const player1Life = publicRooms[name].win[players[0]];
                const player2Life = publicRooms[name].win[players[1]];
                if (player1Life > player2Life) {
                    io.to(players[0]).emit("victory", "Vous avez gagné avec moins de tentatives que l'adversaire");
                    io.to(players[1]).emit("defeat", "Vous avez perdu");
                } else if (player1Life < player2Life) {
                    io.to(players[1]).emit("victory", "Vous avez gagné avec moins de tentatives que l'adversaire");
                    io.to(players[0]).emit("defeat", "Vous avez perdu");
                } else {
                    io.to(players[0]).emit("even", "Égalité, vous avez eu le même score que l'adverdaire");
                    io.to(players[1]).emit("even", "Égalité, vous avez eu le même score que l'adverdaire");
                }
                publicRooms[name].words = {};
                publicRooms[name].win = {};
                publicRooms[name].life = {};
            }
        } else {
            // mode solo
            ({result, remainingLife, win} = guessWord(wordGuessed, privateRooms[socket.id], privateRooms[socket.id].life[socket.id]));
        }
    });

});

function getRandomWordTest() {
    const words = ["APPLE", "BANANA", "CHERRY", "ORANGE", "MELON"];
    return words[Math.floor(Math.random() * words.length)];
}

// Mode solo : génération d'un mot aléatoire
async function getRandomWord() {
    try {
        const random = ~~(Math.random() * wordsNumber);
        const wordQuery = query(collection(db, "words"), where("id", "==", random));
        const querySnapshot = await getDocs(wordQuery);
        if (!querySnapshot.empty) {
            console.log("mot trouvé " + querySnapshot.docs[0].data().word.toUpperCase())
            return querySnapshot.docs[0].data().word.toUpperCase();
        } else {
            console.log("Aucun mot trouvé dans la base de données")
            return null;
        }
    } catch (error) {
        console.error("Erreur lors de la récupération :", error);
    }
}

// Vérification des lettres entrées
function guessLetter(letterGuessed, word, player) {
    if (word.includes(letterGuessed)) {
        io.to(player).emit("correctGuess", correctLetterGuessed(letterGuessed, word));
    } else {
        io.to(player).emit("incorrectGuess");
    }
}

// envoie la partie du mot découverte au client
function correctLetterGuessed(letterGuessed, word) {
    let text = word.split("");
    for (let index in word) {
        if (word[index] !== letterGuessed) {
            text[index] = "_";
        }         
    }
    return text.join("");
}

//Vérification du mot et mise à jour des couleurs
function guessWord(wordGuessed, word, remainingLife) {
    const result = [];
    let win = 0;
    for (let i = 0; i < word.length; i++) {
        const letter = wordGuessed[i];
        if (letter === word[i]) {
            result[i] = [letter, "green"];
            win += 1;
        } else if (word.includes(letter)) {
            result[i] = [letter, "orange"];
        } else {
            result[i] = [letter, "grey"];
        }
    }
    remainingLife -= 1;
    if (win == word.length) {
        win = 1; // victoire
    } else if (remainingLife == 0) {
        win = 0; // défaite
    } else {
        win = 2; // cas neutre
    }
    return {result, remainingLife, win};
}

server.listen(3000, () => console.log("Serveur multijoueur démarré sur http://127.0.0.1:3000"));
