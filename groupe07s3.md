# Rapport de Projet - Group7_AWS

## 1. Introduction
Ce rapport présente l’avancement du projet de jeux de mots **Pendu** et **Wordle**.  
---

## 2. Répartition des Tâches
### Responsable : NOURI YASSIR
- Supervision globale du projet.
- Attribution des tâches à l’équipe.
- Participation au développement des jeux.

### Chercheur : HARGAS ALI
- Recherche des technologies à utiliser.
- résolution des problemes **base de données des mots**.
- Rédaction du présent rapport.

### Codeurs : Maryem BEN-CHARKE & MACHE ETHAN
- Maryem BEN-CHARKE: Développement du **Multi joueur** en Node.js/Socket.io.
- Ali Hargas: Gestion de la base de donénes des mots pour les jeux en Firebase.
-Mache Ethan : Développement du **jeu BombeGame** en HTML/CSS/JavaScript.

---

## 3. Travail Effectué

### Codage des Jeux
- **Wordle** : Implémentation d'un mode multijoueur ou les joueur pourrons s'affronter a tour de rôle.
- **Pendu** : Implémentation d'un mode multijoueur ou les joueur pourrons s'affronter a tour de rôle
-**BombeGame** : implémentation du backend du jeu en mode solo 
.
### Organisation et Tâches Définies par le Responsable
Le **responsable a fixé les objectifs suivants** :
- Mettre en place **une base de données de mots**.
- S'assurer que les jeux soient **fonctionnels en solo ou en ligne** pour le pendu et wordle.
- Préparer l'ajout d'un **nouveau jeu: BombeGame** pour la prochaine phase.

### Recherche Technologique
En tant que **chercheuse**, j’ai étudié les solutions suivantes :

#### Frontend (Interface utilisateur)
- **HTML/CSS/JavaScript** (Solution simple et légère).
- **React.js** (Solution modulaire, meilleure gestion de l’état des jeux).

#### Backend (Gestion des utilisateurs et des scores)
- **Firebase Authentication + Firestore** (Solution facile et rapide à mettre en place).
- **Node.js + Express + MongoDB** (Solution plus avancée, offrant plus de contrôle).
Avantages de Node.js + Express + MongoDB :
Permet d'avoir un serveur backend personnalisé.
Donne un contrôle total sur la base de données et l’API.
Définir nos propres routes API (/get-word, /save-score, /create-user).
Gérer les utilisateurs et leurs scores dans une base MongoDB.
Implémenter des règles spécifiques (ex : choisir des mots selon la difficulté).

Pourquoi nous ne l'avons pas utilisé ?

Firebase offre déjà un backend prêt à l'emploi, sans besoin de configurer un serveur.
Firebase Authentication permet d'authentifier facilement les joueurs sans écrire une API.

- **Avantages de Socket.IO pour un MMO Multijoueur**
 Communication en temps réel ultra-rapide
 Synchronisation efficace des joueurs
 Gestion des événements simplifiée
 Gestion des rooms et canaux
 Bonne scalabilité avec Redis
 Sécurité et gestion des connexions
 Facile à intégrer avec d'autres technologies


#### Base de Données des Mots
- **Stockage local** (Fichier JSON ou Firebase Firestore).

#### Hébergement du Site
- **Firebase Hosting** (Si Firebase est utilisé).
- **Vercel ou Netlify** (Si React.js est utilisé).
On connecte le projet GitHub à Vercel/Netlify.
À chaque git push, le site est automatiquement mis à jour.
- **GitHub Pages** (Si HTML/CSS/JS simple est retenu).
On pousse le code sur GitHub.
On active GitHub Pages dans les paramètres du dépôt.
Le site est accessible en ligne sans autre configuration.

---

## 4. Liens de Recherche
- [Documentation Firebase](https://firebase.google.com/docs)
- [Guide React.js](https://reactjs.org/docs/getting-started.html)
- [Explication du jeu Wordle](https://en.wikipedia.org/wiki/Wordle)
- [API de mots pour Wordle et Pendu](https://www.wordsapi.com/)
L'API WordsAPI (https://www.wordsapi.com/) permet d'obtenir des mots aléatoires et d'autres informations utiles pour des jeux comme Wordle et Pendu.

À quoi ça sert ?
Si nous ne voulons pas stocker nous-mêmes les mots dans un fichier JSON ou une base de données Firebase, 
on peut utiliser WordsAPI pour récupérer des mots en temps réel.
- [Tutoriel Firebase Hosting](https://firebase.google.com/docs/hosting)

---

## 5. Conclusion et Prochaines Étapes
Nous avons bien avancé cette semaine avec :
- L’implémentation des jeux Pendu et Wordle.
- La mise en place des bases techniques.

Prochaines étapes :
- Améliorer **la base de données des mots** l'élargir au plus possible.
- Vérifier que **les jeux sont complètement fonctionnels et en multijoeur**.
- Préparer **la base de données des joueur** pour l'historique des joueur et le classement.

Avec ces avancées, nous pourrons bientôt tester le jeu en équipe et améliorer l'expérience utilisateur.
