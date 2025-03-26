//var socket = io('https://groupe7-aws.onrender.com');
const socket = io("http://127.0.0.1:3000");

socket.on("roomList", (rooms) => {
    const table = document.getElementById("roomsList");
    table.innerHTML = "";
    if (Object.keys(rooms).length === 0) {
        console.log("Salles vides");
    } else {
        console.log("Nouvelle salle reçue");
        for (let name in rooms) {
            let isFull = false;
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.innerText = `${name.toUpperCase()}, joue à ${rooms[name].game}`;
            td.classList.add("cursor");
            tr.className = rooms[name].game;
            tr.id = name.toUpperCase();

            if (rooms[name].players.length >= 2 && rooms[name].game != "bombGame") {
                td.innerText += " COMPLET";
                td.classList.remove("cursor");
                isFull = true;
            } else {
                if (rooms[name].password && rooms[name].password.trim() !== "") {
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
    let name = document.getElementById("roomName");
    if (document.getElementById(name.value.toUpperCase())) {
        alert("Nom déjà utilisé");
        name.value = "";
    } else {
        const game = document.getElementById("gameSelect").value;
        const password = document.getElementById("password").value;
        localStorage.setItem("name", name.value);
        socket.emit("createRoom", ({name: name.value, game, password}));
        window.location.href = `/${game}.html`;
    }
    
}

function validName(name) {
    if (document.getElementById(name)) {
        return false;
    }
    return true;
}

function getPassword(name) {
    return new Promise((resolve, reject) => {
        const modal = document.getElementById("passwordModal");
        const button = document.getElementById("buttonPassword");
        const closeButton = document.getElementById("closePasswordTable");

        // Afficher le modal
        modal.style.display = "flex";

        // Valider le mot de passe
        button.addEventListener("click", () => {
            const tryPassword = document.getElementById("inputPassword").value;
            socket.emit("getPassword", tryPassword, name);
            socket.once("passwordResponse", (isCorrect) => {
                if (isCorrect) {
                    resolve(true);
                    modal.style.display = "none"; // Fermer le modal si le mot de passe est correct
                } else {
                    tryPassword.value = "";
                    tryPassword.placeholder = "Mot de passe incorrect";
                }
            });
        });

        // Fermer le modal
        closeButton.addEventListener("click", () => {
            reject();
            modal.style.display = "none"; // Masquer le modal si l'utilisateur annule
        });
    });
}


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("createRoom").addEventListener("click", createRoom);
});