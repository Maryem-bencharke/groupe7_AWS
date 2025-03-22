# Rapport de Projet - Group7_AWS

## 1. Introduction
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

---

## 3. Travail Effectué

### Codage des Jeux
- **Wordle** : Implémentation des mécaniques de jeu et des règles.
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

---

## 4. Liens de Recherche
- [Documentation IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Guide Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Concept du jeu Wordle](https://en.wikipedia.org/wiki/Wordle)
- [Tutoriel sur les jeux multijoueurs en JavaScript](https://developer.mozilla.org/en-US/docs/Games/Multiplayer)
- [Gestion des classements et statistiques](https://firebase.google.com/docs/database)
- [Vidéo explicative sur IndexedDB](https://youtu.be/-AzFQN9Vp7k)

---

## 5. Conclusion et Prochaines Étapes
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

