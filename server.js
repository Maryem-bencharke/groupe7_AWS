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

let waitingPlayer = null; // Stocke un joueur en attente
let rooms = {}; // Stocke les parties en cours

io.on("connection", (socket) => {
    console.log(`Un joueur s'est connecté : ${socket.id}`);

    // Vérification pour éviter les connexions fantômes
    if (waitingPlayer === null) {
        waitingPlayer = socket;
        socket.emit("waiting", "En attente d'un adversaire...");
    } else {
        // Créer une salle avec les 2 joueurs
        const room = `room-${Date.now()}`;
        const word = getRandomWord();  // On génère un mot aléatoire
        rooms[room] = {
            players: [waitingPlayer.id, socket.id],
            word: word,
            guesses: { [waitingPlayer.id]: "", [socket.id]: "" }
        };

        waitingPlayer.join(room);
        socket.join(room);
        io.to(room).emit("startGame", { room, wordLength: word.length, word });

        console.log(`Salle créée : ${room} avec ${waitingPlayer.id} et ${socket.id}`);
        waitingPlayer = null; // Réinitialiser la file d’attente
    }

    // Gestion des tentatives de mots (Wordle)
    socket.on("guessWord", ({ room, guess }) => {
        if (rooms[room]) {
            const correctWord = rooms[room].word;
            rooms[room].guesses[socket.id] = guess;

            if (guess === correctWord) {
                io.to(room).emit("gameOver", { winner: socket.id, correctWord });
                delete rooms[room];
            } else {
                io.to(room).emit("updateGame", { playerId: socket.id, guess });
            }
        }
    });

    // Gestion de la déconnexion d’un joueur
    socket.on("disconnect", () => {
        console.log(`Un joueur s'est déconnecté : ${socket.id}`);
        Object.keys(rooms).forEach(room => {
            if (rooms[room].players.includes(socket.id)) {
                io.to(room).emit("gameOver", { winner: "Déconnexion", correctWord: rooms[room].word });
                delete rooms[room];
            }
        });
    });
});

// Fonction pour récupérer un mot aléatoire (simple)
function getRandomWord() {
    const words = ["APPLE", "BANANA", "CHERRY", "ORANGE", "MELON"];
    return words[Math.floor(Math.random() * words.length)];
}

server.listen(3000, () => console.log("🚀 Serveur multijoueur démarré sur http://127.0.0.1:3000"));
