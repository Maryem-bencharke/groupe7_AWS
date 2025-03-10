import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

async function getLeaderboard() {
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);
    
    let leaderboard = [];
    
    usersSnapshot.forEach((doc) => {
        let data = doc.data();
        leaderboard.push({
            username: data.username,
            wins: data.wins || 0,
            losses: data.losses || 0
        });
    });

    // Trier les joueurs par nombre de victoires décroissant
    leaderboard.sort((a, b) => b.wins - a.wins);

    console.log("🏆 Classement des joueurs :");
    leaderboard.forEach((player, index) => {
        console.log(`#${index + 1} ${player.username} - ${player.wins} victoires, ${player.losses} défaites`);
    });

    return leaderboard;
}

// Affichage du classement dans la page HTML
document.getElementById("showLeaderboard").addEventListener("click", async () => {
    const leaderboard = await getLeaderboard();
    let leaderboardDisplay = document.getElementById("leaderboard");
    leaderboardDisplay.innerHTML = leaderboard.map((player, index) =>
        `<p>#${index + 1} ${player.username} - ${player.wins} victoires, ${player.losses} défaites</p>`
    ).join("");
});
