const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let waitingPlayer = null;
let rooms = {};
let penduPlayers = new Set();
let wordlePlayers = new Set();
let bombPlayers = new Set();

io.on("connection", (socket) => {
    console.log(`Un joueur s'est connecté : ${socket.id}`);

    socket.emit("roomList", rooms);

    socket.on("createRoom", ({name, game}) => {
        rooms[name] = {
            players: [],
            game: game,
        };
        socket.join(name);
        io.emit("roomList", rooms);        
    });

    socket.on("joinRoom", (name) => {
        console.log("room : " + name + " connecter avec : " + socket.id);
        rooms[name].players.push(socket.id);
        socket.join(name);
        if (rooms[name].players.length === 2) {
            io.to(name).emit("chooseWords", "Choisissez un mot pour l'adversaire");
        }
    });

    socket.on("wordChoosen", ({name, word}) => {
        if (!rooms[name].words) {
            rooms[name].words = {};
        }
        rooms[name].words[socket.id] = word;

        if (Object.keys(rooms[name].words).length === 2) {
            const players = Object.keys(rooms[name].words);
            const word1 = rooms[name].words[players[0]];
            const word2 = rooms[name].words[players[1]];
            io.to(players[0]).emit("startGuessing", "_ ".repeat(word2.length));
            io.to(players[1]).emit("startGuessing", "_ ".repeat(word1.length));
        }
    });

    socket.on("guessLetter", ({name, letter}) => {
        const players = Object.keys(rooms[name].words);
        if (players[0] === socket.id) {
            guess(letter, rooms[name].words[players[1]], players[0]);
        } else {
            guess(letter, rooms[name].words[players[0]], players[1]);
        }
        
    });

});

function getRandomWord() {
    const words = ["APPLE", "BANANA", "CHERRY", "ORANGE", "MELON"];
    return words[Math.floor(Math.random() * words.length)];
}

// Vérification des lettres entrées
function guess(letterGuessed, word, player) {
    if (word.includes(letterGuessed)) {
        io.to(player).emit("correctGuess", letterGuessed);
    } else {
        io.to(player).emit("incorrectGuess");
    }
}

server.listen(3000, () => console.log("Serveur multijoueur démarré sur http://127.0.0.1:3000"));
