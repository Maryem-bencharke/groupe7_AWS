const socket = io("http://127.0.0.1:3000");

socket.on("roomList", (rooms) => {
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
            td.addEventListener("click", () => {
                localStorage.setItem("name", name);
                switch (rooms[name].game) {
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
            });
            tr.appendChild(td);
            table.appendChild(tr);
        }
    }
});

function createRoom() {
    const name = document.getElementById("roomName").value;
    const game = document.getElementById("gameSelect").value;
    localStorage.setItem("name", name);
    socket.emit("createRoom", ({name, game}));
    window.location.href = `/${game}.html`;
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("createRoom").addEventListener("click", createRoom);
});