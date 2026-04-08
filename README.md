# 🌐 CV Portfolio - Laurélenne Poussin

Portfolio web personnel orienté recrutement, conçu pour présenter mon parcours, mes compétences techniques et mes projets de façon claire, moderne et interactive.

👉 [Voir la version en ligne](https://laurelenne.github.io/cv-portfolio)

`HTML5` • `CSS3/SCSS` • `JavaScript` • `JSON Data-driven` • `GitHub Pages`

![Aperçu du portfolio](./public/assets/gif/cv-portfolio.gif)

## 🧭 Sommaire

1. [Objectif](#objectif)
2. [Fonctionnalités](#fonctionnalités)
3. [Stack technique](#stack-technique)
4. [Structure du projet](#structure-du-projet)
5. [Lancer le projet en local](#lancer-le-projet-en-local)
6. [Personnalisation du contenu](#personnalisation-du-contenu)
7. [Qualité, performance et UX](#qualité-performance-et-ux)
8. [Déploiement](#déploiement)
9. [Roadmap](#roadmap)
10. [Contact](#contact)

---

## 🎯 Objectif

Ce projet répond a trois objectifs principaux :

- 👩‍💻 présenter un profil développeuse web de manière professionnelle ;
- 🚀 valoriser des réalisations concrètes (frontend, backend, API, UI/UX) ;
- ✨ proposer une navigation plus dynamique et engageante qu'un CV PDF classique.

---

## ✨ Fonctionnalités

- page d'accueil avec hero animé ;
- section compétences enrichie et catégorisée ;
- timeline de parcours ;
- liste de projets pilotée par des données JSON ;
- page détail projet ;
- formulaire de contact ;
- animations au scroll et améliorations de navigation ;
- design responsive desktop, tablette et mobile.

### 🎁 Bonus expérience

- chargement rapide et contenu structuré ;
- navigation claire pour recruteurs et profils techniques ;
- équilibre entre sobriété pro et identité visuelle.

---

## ⚙️ Stack technique

### 🎨 Frontend

- HTML5
- CSS3
- SCSS
- JavaScript vanilla (ES6+)

### 🗂️ Données

- JSON pour les projets, compétences et timeline

### 🧰 Outils

- Git / GitHub
- GitHub Pages (déploiement)

---

## 🏗️ Structure du projet

```text
.
|- index.html
|- cv.html
|- projet.html
|- src/
|  |- data/
|  |  |- projects.json
|  |  |- skills.json
|  |  `- timeline.json
|  |- scripts/
|  |  |- modules/
|  |  `- pages/
|  `- styles/
|     |- base/
|     |- sections/
|     |- pages/
|     `- utilities/
`- public/
	`- assets/
```

## ✍️ Personnalisation du contenu

Le site est pensé pour être maintenable sans modifier le coeur des scripts.

### 📁 Projets

Modifier src/data/projects.json pour :

- ajouter un nouveau projet ;
- mettre a jour les technologies ;
- brancher un lien GitHub ou démo.

### 🧠 Compétences

Modifier src/data/skills.json pour :

- ajuster les domaines de compétences ;
- activer/désactiver des compétences mises en avant ;
- faire évoluer les niveaux.

### 🕒 Timeline

Modifier src/data/timeline.json pour mettre a jour le parcours et les jalons.

---

## ✅ Qualité, performance et UX

- architecture CSS segmentée (base, sections, pages, utilities) ;
- scripts modulaires par responsabilité ;
- séparation contenu / logique via JSON ;
- animations ciblées pour améliorer la lisibilité sans surcharger l'interface ;
- responsive design sur les principaux formats d'écran
---

## 🚀 Déploiement

Le portfolio est publié avec GitHub Pages.

- URL : https://laurelenne.github.io/cv-portfolio
- mise a jour : push sur la branche de publication, puis déploiement automatique

## 📫 Contact

Pour toute opportunité, collaboration ou échange technique :

- GitHub : https://github.com/laurelenne
- Portfolio : https://laurelenne.github.io/cv-portfolio