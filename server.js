const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // Assure-toi que le fichier est bien à cet endroit

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
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
    console.log(`Un joueur s'est connecté : ${socket.id}`);

    socket.on("joinGame", async () => {
        console.log(`Un joueur a rejoint une partie : ${socket.id}`);
        players.add(socket.id);

        if (waitingPlayer === null) {
            waitingPlayer = socket;
            socket.emit("waiting", "En attente d'un adversaire...");
        } else {
            if (!waitingPlayer.connected) {
                console.log(`Suppression d'un joueur déconnecté`);
                waitingPlayer = socket;
                socket.emit("waiting", "En attente d'un adversaire...");
                return;
            }

            const room = `room-${Date.now()}`;
            const word = await getRandomWord();

            rooms[room] = {
                players: [waitingPlayer.id, socket.id],
                word: word,
                lives: { [waitingPlayer.id]: 6, [socket.id]: 6 }
            };

            waitingPlayer.join(room);
            socket.join(room);
            io.to(room).emit("startGame", { room, wordLength: word.length, word });

            console.log(`Salle créée : ${room} avec ${waitingPlayer.id} et ${socket.id}`);
            waitingPlayer = null;
        }
    });

    socket.on("guessLetter", ({ room, letter }) => {
        if (rooms[room]) {
            io.to(room).emit("opponentGuess", { letter });
        }
    });

    socket.on("gameOver", ({ room, winner, correctWord }) => {
        if (rooms[room]) {
            io.to(room).emit("gameOver", { winner, correctWord });
            console.log(`Fin de partie dans ${room} : gagnant ${winner}, mot correct ${correctWord}`);
            delete rooms[room];
        }
    });

    socket.on("disconnect", () => {
        console.log(`Un joueur s'est déconnecté : ${socket.id}`);
        players.delete(socket.id);

        Object.keys(rooms).forEach(room => {
            if (rooms[room].players.includes(socket.id)) {
                io.to(room).emit("gameOver", { winner: "Déconnexion", correctWord: rooms[room].word });
                delete rooms[room];
            }
        });
    });
});

async function getRandomWord() {
    try {
        const wordsRef = db.collection("words");
        const snapshot = await wordsRef.get();

        if (snapshot.empty) {
            console.warn("Aucun mot trouvé dans Firebase.");
            return "DEFAULT";
        }

        const words = snapshot.docs.map(doc => doc.data().word);
        return words[Math.floor(Math.random() * words.length)];
    } catch (error) {
        console.error("Erreur lors de la récupération du mot :", error);
        return "ERROR";
    }
}

server.listen(3000, () => console.log("Serveur multijoueur démarré sur http://127.0.0.1:3000"));