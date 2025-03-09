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

io.on("connection", ({socket}) => {
    console.log(`Un joueur s'est connecté : ${socket.id}`);

    socket.emit("roomList", rooms);

    socket.on("createRoom", ({name, game}) => {
        rooms[name] = {
            players: [socket.id],
            game: game,
        };
        socket.join(name);
        io.emit("roomList", rooms);
        socket.emit("redirect", `/${game}.html`);
        
    });

    socket.on("joinRoom", ({name}) => {
        rooms[name].players.add(socket.id);
        if (rooms[name].players.length === 2) {
            io.to(name).emit("chooseWords", "Choisissez un mot pour l'adversaire");
        }
    });

    socket.on("wordChoosen", ({name, word}) => {
        // à compléter
    })

});

function getRandomWord() {
    const words = ["APPLE", "BANANA", "CHERRY", "ORANGE", "MELON"];
    return words[Math.floor(Math.random() * words.length)];
}

server.listen(3000, () => console.log("Serveur multijoueur démarré sur http://127.0.0.1:3000"));
