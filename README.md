# AVOCIUM — Application React de gestion d'un cabinet d'avocat

Prototype de logiciel de gestion juridique pour un cabinet au Maroc.

## Fonctionnalités disponibles

- Interface en arabe, contenu de droite à gauche et menu à gauche. L’accueil ouvre le tableau de bord analytique.
- Périodes, graphiques, alertes, export CSV compatible Excel et impression PDF via le navigateur. Les montants encaissés sont regroupés selon la date de la facture correspondante.
- Dossiers avec vue cartes ou tableau, recherche, compteurs et filtre des archives.

- Tableau de bord des dossiers, audiences, clients et honoraires
- Création, modification et suppression des dossiers judiciaires
- Fichier clients (personnes physiques et morales)
- Suivi et calendrier sous forme de liste des audiences
- Documents et mémoires avec pièces jointes locales, recherche, téléchargement et impression des fiches.
- Répertoire des tribunaux et suivi des tâches avec calendrier et Kanban.
- Audiences en liste, semaine, mois ou Kanban.
- Facturation par client ou facture, lignes détaillées, TVA paramétrable et suivi des retards.
- Factures, règlements partiels et calcul du solde
- Recherche, filtres, exports CSV, interface responsive
- Données de démonstration fictives, sauvegardées dans le `localStorage` du navigateur

## Installation

Pré-requis : Node.js 20.19+ ou 22.12+ et npm.

```bash
npm ci
npm run dev
```

Ouvrir l'URL locale affichée par Vite (habituellement `http://localhost:5173`).

Compilation de production :

```bash
npm run build
npm run preview
```

## IMPORTANT : limites de cette version

Cette version est destinée aux essais avec des données fictives. Les données sont enregistrées uniquement dans le navigateur (non chiffrées, non synchronisées, sans sauvegardes serveur). Les pièces jointes sont conservées dans IndexedDB sur le navigateur utilisé. Le marquage de confidentialité sert au classement et ne contrôle pas les accès. Les utilisateurs, autorisations, authentification et notifications restent à implémenter.

Ne pas importer de dossiers réels, données personnelles sensibles ou pièces confidentielles.

## Évolutions nécessaires avant production

1. API Node.js (NestJS/Express) + PostgreSQL (Prisma), migrations, validation et transactions.
2. Authentification MFA, sessions sécurisées, gestion des rôles (administrateur, avocat, assistant, comptabilité), contrôles d'accès **par dossier** côté API.
3. Gestion documentaire sécurisée (stockage objet privé, antivirus, versionnement, permissions, historique d'accès).
4. Audit d'accès et des modifications, sauvegardes chiffrées et procédures de restauration.
5. Agenda et rappels d'audience avec fuseau horaire `Africa/Casablanca`, calendrier judiciaire et notifications.
6. Facturation avec numérotation, reçus, taxes et mentions légales adaptées au contexte marocain.
7. Conformité à la législation marocaine applicable (notamment loi 09-08 et obligations de confidentialité professionnelle), revue juridique et tests de sécurité avant mise en service.

## Technologie

React 19, Vite 7, lucide-react, CSS responsive. Aucune dépendance à un service externe côté données.
