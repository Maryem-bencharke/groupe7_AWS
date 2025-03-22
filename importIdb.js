const localforage = require("localforage-node");

// Configuration de LocalForage pour Node.js
localforage.config({
    driver: localforage.LOCALSTORAGE, // Utilisation de localStorage comme backend pour Node.js
    name: 'Dictionnaire',  // Le nom de la base de données
    storeName: 'mots',     // Nom du store (table) pour les mots
    description: 'Une base de données de mots'
});

// Fonction pour ajouter un mot à la base de données
async function ajouterMot(mot) {
    try {
        const taille = mot.length;
        await localforage.setItem(mot, { mot, taille });
        console.log(`Mot ajouté : ${mot}`);
    } catch (err) {
        console.error("Erreur lors de l'ajout du mot :", err);
    }
}

// Fonction pour récupérer tous les mots d'une certaine taille
async function getMotsParTaille(taille) {
    try {
        const mots = [];
        const keys = await localforage.keys(); // Récupère toutes les clés
        for (let key of keys) {
            const mot = await localforage.getItem(key);
            if (mot.taille === taille) {
                mots.push(mot);
            }
        }
        console.log(`Mots de taille ${taille}:`, mots);
        return mots;
    } catch (err) {
        console.error("Erreur lors de la récupération des mots :", err);
    }
}

// Exemple d'utilisation
async function main() {
    await ajouterMot("bonjour");
    await ajouterMot("ordinateur");
    await ajouterMot("chat");
    await ajouterMot("programmation");
    await ajouterMot("soleil");

    // Récupérer tous les mots de taille 6
    await getMotsParTaille(6);
}

// Exécuter le programme
main();
