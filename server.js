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
let players = new Set();

io.on("connection", (socket) => {
    console.log(`👤 Un vrai joueur s'est connecté : ${socket.id}`);

    socket.on("joinGame", () => {
        console.log(`✅ Un joueur a rejoint une partie : ${socket.id}`);
        players.add(socket.id);

        if (waitingPlayer === null) {
            waitingPlayer = socket;
            socket.emit("waiting", "En attente d'un adversaire...");
        } else {
            if (!waitingPlayer.connected) {
                console.log(`❌ Suppression d'un joueur déconnecté`);
                waitingPlayer = socket;
                socket.emit("waiting", "En attente d'un adversaire...");
                return;
            }

            const room = `room-${Date.now()}`;
            const word = getRandomWord();

            rooms[room] = {
                players: [waitingPlayer.id, socket.id],
                word: word,
                lives: { [waitingPlayer.id]: 6, [socket.id]: 6 }
            };

            waitingPlayer.join(room);
            socket.join(room);
            io.to(room).emit("startGame", { room, wordLength: word.length, word });

            console.log(`🆕 Salle créée : ${room} avec ${waitingPlayer.id} et ${socket.id}`);
            waitingPlayer = null;
        }
    });

    socket.on("guessLetter", ({ room, letter }) => {
        if (rooms[room]) {
            io.to(room).emit("opponentGuess", { letter });
        }
    });

    // 🔴 GESTION IMMÉDIATE DE LA FIN DE PARTIE
    socket.on("gameOver", ({ room, winner, correctWord }) => {
        if (rooms[room]) {
            io.to(room).emit("gameOver", { winner, correctWord });
            console.log(`🔴 Fin de partie dans ${room} : gagnant ${winner}, mot correct ${correctWord}`);
            delete rooms[room];
        }
    });

    socket.on("disconnect", () => {
        console.log(`❌ Un joueur s'est déconnecté : ${socket.id}`);
        players.delete(socket.id);

        Object.keys(rooms).forEach(room => {
            if (rooms[room].players.includes(socket.id)) {
                io.to(room).emit("gameOver", { winner: "Déconnexion", correctWord: rooms[room].word });
                delete rooms[room];
            }
        });
    });
});

function getRandomWord() {
    const words = ["APPLE", "BANANA", "CHERRY", "ORANGE", "MELON"];
    return words[Math.floor(Math.random() * words.length)];
}

server.listen(3000, () => console.log("🚀 Serveur multijoueur démarré sur http://127.0.0.1:3000"));
