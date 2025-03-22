# Rapport de Projet - Group7_AWS

## 1. Introduction
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
- Ali Hargas: Gestion de la base de donénes des mots pour les jeux en Firebase.
-Mache Ethan : Développement du **jeu Pendu** en HTML/CSS/JavaScript.

---

## 3. Travail Effectué

### Codage des Jeux
- **Wordle** : Implémentation des mécaniques de jeu et des règles.
- **Pendu** : Gestion des erreurs et affichage des lettres correctement devinées.

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
Avantages de Node.js + Express + MongoDB :
Permet d'avoir un serveur backend personnalisé.
Donne un contrôle total sur la base de données et l’API.
Définir nos propres routes API (/get-word, /save-score, /create-user).
Gérer les utilisateurs et leurs scores dans une base MongoDB.
Implémenter des règles spécifiques (ex : choisir des mots selon la difficulté).

Pourquoi nous ne l'avons pas utilisé ?

Firebase offre déjà un backend prêt à l'emploi, sans besoin de configurer un serveur.
Firebase Authentication permet d'authentifier facilement les joueurs sans écrire une API.

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
- Finaliser **la base de données des mots**.
- Vérifier que **les jeux sont complètement fonctionnels**.
- Préparer **le mode multijoueur**.

Avec ces avancées, nous pourrons bientôt tester le jeu en équipe et améliorer l'expérience utilisateur.
