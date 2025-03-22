# Rapport de Projet - Group7_AWS

## 1. Introduction
<<<<<<< HEAD
Ce rapport présente l’avancement du projet de jeux de mots **Pendu**, **Wordle**, ainsi que le nouveau jeu **Bombe Game**. L'objectif est de finaliser ces jeux afin de présenter un projet propre et fonctionnel lors de la soutenance.

---

## 2. Répartition des Tâches

### Responsable : MARYEM BEN-CHARKE
- Supervision globale du projet.
- Attribution des tâches à l’équipe.
- Coordination des travaux et suivi des avancées.

### Chercheur : NOURI YASSIR
- Recherche des technologies à utiliser.
- Analyse des solutions pour le stockage des mots.
- Étude de **IndexedDB** comme alternative au Local Storage et à Firestore.
- Rédaction du présent rapport.

### Codeurs : MACHE ETHAN & HARGAS ALI
- **Ethan Mache** :
  - Amélioration du **troisième jeu** et intégration à la page d'accueil.
  - Développement du mode **multijoueur**.
  - Modification des règles du mode multijoueur pour **Pendu** et **Wordle**.
  - Implémentation d'un système de **salles** pour choisir qui rejoindre.
  - Intégration du nouveau jeu **Bombe Game**.

- **Ali Hargas** :
  - Résolution des problèmes liés à la **base de données**.
  - Intégration de la base dans le **mode multijoueur** de **Wordle** et **Pendu**.
  - Ajout d'une **fonctionnalité de comptabilisation des victoires et classement**.
=======
Ce rapport présente l’avancement du projet de jeux de mots **Pendu** et **Wordle**.  
---

## 2. Répartition des Tâches
### Responsable : MACHE ETHAN
- Supervision globale du projet.
- Attribution des tâches à l’équipe.
- Participation au développement des jeux.

### Chercheuse : Maryem BEN-CHARKE
- Recherche des technologies à utiliser.
- Étude des solutions pour la **base de données des mots**.
- Rédaction du présent rapport.

### Codeurs : HARGAS ALI & NOURI YASSIR
- Yassir Nouri: Développement du **jeu Wordle** en HTML/CSS/JavaScript.
- Ali Hargas: Gestion de la base de données des mots pour les jeux en Firebase.
-Mache Ethan : Développement du **jeu Pendu** en HTML/CSS/JavaScript.
>>>>>>> 10f5cfcbf54b41375dcbc8427743ce4ac56def26

---

## 3. Travail Effectué

### Codage des Jeux
- **Wordle** : Implémentation des mécaniques de jeu et des règles.
<<<<<<< HEAD
- **Pendu** : Gestion des erreurs et affichage des lettres correctement devinées.
- **Troisième jeu** : Amélioration et ajout à la page d'accueil.
- **Bombe Game** : Intégration et ajustements des mécaniques de jeu.

### Organisation et Nouvelles Tâches
Le **responsable a fixé les objectifs suivants** :
- Explorer **IndexedDB** pour le stockage des mots.
- Modifier les règles du **mode multijoueur** pour Wordle et Pendu.
- Implémenter un système de **salles** accessibles via une page d'accueil.
- Intégrer la **base de données des mots** au mode multijoueur.
- Mettre en place un **classement et un suivi des victoires**.
- Finaliser **Bombe Game**.

### Recherche Technologique
En tant que **chercheur**, j’ai étudié les solutions suivantes :

#### Stockage des Mots
- **IndexedDB** (Stockage côté client, persistance même après fermeture du navigateur, plus efficace que Local Storage).
- **Local Storage** (Simple mais moins flexible et limité en taille).
- **Firebase Firestore** (Base de données cloud, utile pour le multijoueur mais nécessite une connexion internet).

#### Mode Multijoueur et Salles
- Système de **lobby** affichant les salles disponibles.
- Attribution des joueurs à des salles en fonction de critères prédéfinis.
- Gestion des **scores** et suivi des parties.

#### Intégration de la Base de Données
- Ali travaille sur la synchronisation entre la base et le mode multijoueur.
- Possibilité d'utiliser Firebase pour sauvegarder les **scores et statistiques des joueurs**.
=======
- **Pendu** : Le pendu il est jouable avec des mots aléatoire qui sont connecter à firebase.

### Organisation et Tâches Définies par le Responsable
Le **responsable a fixé les objectifs suivants** :
- Mettre en place **une base de données de mots**.
- S'assurer que les jeux soient **fonctionnels ou presque**.
- Préparer l'ajout du **mode multijoueur** pour la prochaine phase.

### Recherche Technologique
En tant que **chercheuse**, j’ai étudié les solutions suivantes :

#### Frontend (Interface utilisateur)
- **HTML/CSS/JavaScript** (Solution simple et légère).
- **React.js** (Solution modulaire, meilleure gestion de l’état des jeux).

#### Backend (Gestion des utilisateurs et des scores)
- **Firebase Authentication + Firestore** (Solution facile et rapide à mettre en place).
- **Node.js + Express + MongoDB** (Solution plus avancée, offrant plus de contrôle).

#### Base de Données des Mots
- **Stockage local** (Fichier JSON ou Firebase Firestore).

#### Hébergement du Site
- **Firebase Hosting** (Si Firebase est utilisé).
- **Vercel ou Netlify** (Si React.js est utilisé).
- **GitHub Pages** (Si HTML/CSS/JS simple est retenu).
>>>>>>> 10f5cfcbf54b41375dcbc8427743ce4ac56def26

---

## 4. Liens de Recherche
<<<<<<< HEAD
- [Documentation IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Guide Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Concept du jeu Wordle](https://en.wikipedia.org/wiki/Wordle)
- [Tutoriel sur les jeux multijoueurs en JavaScript](https://developer.mozilla.org/en-US/docs/Games/Multiplayer)
- [Gestion des classements et statistiques](https://firebase.google.com/docs/database)
- [Vidéo explicative sur IndexedDB](https://youtu.be/-AzFQN9Vp7k)
=======
- [Documentation Firebase](https://firebase.google.com/docs)
- [Guide React.js](https://reactjs.org/docs/getting-started.html)
- [Explication du jeu Wordle](https://en.wikipedia.org/wiki/Wordle)
- [API de mots pour Wordle et Pendu](https://www.wordsapi.com/)
- [Tutoriel Firebase Hosting](https://firebase.google.com/docs/hosting)
>>>>>>> 10f5cfcbf54b41375dcbc8427743ce4ac56def26

---

## 5. Conclusion et Prochaines Étapes
<<<<<<< HEAD
Nous avons bien avancé avec :
- L'amélioration du troisième jeu et son intégration sur la page d'accueil.
- L'étude de nouvelles solutions de stockage (évaluation de **IndexedDB**).
- Le développement d'un mode **multijoueur** et d'un système de **salles**.
- L'intégration du jeu **Bombe Game**.

Prochaines étapes :
- Bien tester la finalisation de **l'intégration de la base de données**.
- S'assurer que tous les jeux sont fonctionnels (les deux modes).
- S'assurer que le projet soit **prêt à être présenté proprement lors de la soutenance**.

Avec ces avancées, nous pourrons bientôt proposer une version finalisée et prête pour la présentation.

=======
Nous avons bien avancé cette semaine avec :
- L’implémentation des jeux Pendu et Wordle.
- La mise en place des bases techniques.

Prochaines étapes :
- Vérifier que **les jeux sont complètement fonctionnels**.
- Préparer **le mode multijoueur**.

Avec ces avancées, nous pourrons bientôt tester le jeu en équipe et améliorer l'expérience utilisateur.
>>>>>>> 10f5cfcbf54b41375dcbc8427743ce4ac56def26
