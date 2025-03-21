const socket = io("http://127.0.0.1:3000");

socket.on("roomList", (rooms, password) => {
    const table = document.getElementById("roomsList");
    table.innerHTML = "";
    if (Object.keys(rooms).length === 0) {
        console.log("Salles vides");
    } else {
        console.log("Nouvelle salle reçue");
        for (let name in rooms) {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.innerText = `${name.toUpperCase()}, joue à ${rooms[name].game}`;
            td.classList.add("cursor");
            tr.className = rooms[name].game;
            if (password && password.trim() !== "") {
                td.innerText += ", mot de passe requis";
                td.addEventListener("click", async () => {
                    try {
                        const correctPassword = await getPassword(name);
                        if (correctPassword) {
                            localStorage.setItem("name", name);
                            goToGame(rooms[name].game);
                        }
                    } catch (error) {}
                });
            } else {
                td.addEventListener("click", () => {
                    localStorage.setItem("name", name);
                    goToGame(rooms[name].game);
                });
            }
            
            tr.appendChild(td);
            table.appendChild(tr);
        }
    }
});

function goToGame(game) {
    switch (game) {
        case "pendu":
            window.location.href = 'pendu.html';
            break;
        case "wordle":
            window.location.href = 'wordle.html';
            break;
        case "bombGame":
            window.location.href = 'bombGame.html';
            break;
    }
}

function createRoom() {
    const name = document.getElementById("roomName").value;
    const game = document.getElementById("gameSelect").value;
    const password = document.getElementById("password").value;
    localStorage.setItem("name", name);
    socket.emit("createRoom", ({name, game, password}));
    window.location.href = `/${game}.html`;
}

function getPassword(name) {
    return new Promise((resolve, reject) => {
        document.getElementById("passwordTable").style.display = "block";
        const button = document.getElementById("buttonPassword");
        button.addEventListener("click", () => {
            const tryPassword = document.getElementById("inputPassword");
            socket.emit("getPassword", tryPassword.value, name);
            socket.once("passwordResponse", (isCorrect) => {
                if (isCorrect) {
                    resolve(true);
                } else {
                    tryPassword.value = "";
                    tryPassword.placeholder = "Mdp incorrect";
                }
            });
        });
        document.getElementById("closePasswordTable").addEventListener("click", () => {
            reject();
            document.getElementById("passwordTable").style.display = "none";
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("createRoom").addEventListener("click", createRoom);
});