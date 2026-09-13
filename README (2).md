# Portfolio d’Axel Busquin — GitHub Pages + Pages CMS

Ce dossier contient un site statique sans compilation, prêt à publier gratuitement sur GitHub Pages. Son contenu se modifie visuellement avec Pages CMS, depuis un compte GitHub autorisé à écrire dans le dépôt.

## Ce qui est inclus

- cinq rubriques : biographie et CV, travaux, projets, pédagogie et ressources utiles ;
- une administration accessible à l’adresse `/admin/` ;
- des blocs ajoutables, supprimables et réordonnables dans chaque rubrique ;
- cinq types de blocs : texte, parcours/travail, projet, PDF et lien ;
- le dépôt de PDF depuis l’éditeur ;
- un lecteur PDF intégré, avec solution de repli « ouvrir/télécharger » ;
- un affichage adapté aux ordinateurs, tablettes, mobiles et à l’impression.

## 1. Publier sur GitHub Pages

Le plus simple est de créer un dépôt public nommé `VOTRE-PSEUDO.github.io`. Dans ce cas, l’adresse du site sera `https://VOTRE-PSEUDO.github.io/`.

1. Créez le dépôt sur GitHub.
2. Décompressez cette archive et envoyez **le contenu du dossier** à la racine du dépôt. Il faut notamment conserver `.pages.yml`, `index.html`, `assets/`, `content/`, `media/` et `admin/`.
3. Dans le dépôt, ouvrez **Settings → Pages**.
4. Dans **Build and deployment**, sélectionnez **Deploy from a branch**.
5. Choisissez la branche **main**, le dossier **/(root)**, puis enregistrez.

On peut aussi utiliser un dépôt portant un autre nom : le site sera alors disponible à l’adresse `https://VOTRE-PSEUDO.github.io/NOM-DU-DEPOT/`. Les chemins du portfolio sont déjà compatibles avec ce cas.

## 2. Activer l’administration

1. Ouvrez [Pages CMS](https://app.pagescms.org/).
2. Connectez-vous avec GitHub et autorisez l’accès au dépôt du portfolio.
3. Sélectionnez ce dépôt. Pages CMS détectera automatiquement le fichier `.pages.yml`.
4. Ouvrez **Contenu du portfolio**.

L’adresse `/admin/` de votre site sert ensuite de raccourci vers cette connexion.

## 3. Ajouter et modifier des blocs

Dans **Contenu du portfolio**, chaque rubrique possède une liste **Blocs de la rubrique**.

1. Ouvrez la rubrique voulue.
2. Ajoutez un élément dans la liste des blocs.
3. Choisissez son type :
   - **Texte libre** pour une présentation ou une note ;
   - **Parcours, publication ou expérience** pour une entrée large et structurée ;
   - **Projet personnel** pour une carte de projet ;
   - **PDF avec lecteur intégré** pour un mémoire, une publication ou un support ;
   - **Ressource ou lien externe** pour une référence utile.
4. Réordonnez les blocs par glisser-déposer.
5. Désactivez **Visible sur le site** pour préparer un bloc sans l’afficher.
6. Enregistrez. Pages CMS crée une modification versionnée dans GitHub, puis GitHub Pages republie le site.

## 4. Ajouter le CV et les PDF

- Le CV se dépose dans **Identité, CV et GitHub → CV au format PDF**.
- Un autre document se dépose dans un bloc **PDF avec lecteur intégré**.
- Les fichiers sont stockés dans `media/docs/` et leur chemin est enregistré dans `content/site.json`.
- Le bouton **Lire le PDF** ouvre le lecteur intégré. Le second bouton permet de l’ouvrir ou de le télécharger directement si le navigateur ne sait pas l’afficher.

## 5. À personnaliser au premier passage

Dans la partie **Identité, CV et GitHub**, renseignez :

- votre adresse e-mail ;
- votre URL GitHub exacte ;
- votre CV PDF ;
- éventuellement une autre localisation ou phrase de présentation.

Les champs sont volontairement laissés vides dans la version fournie afin de ne pas inventer de coordonnées.

## Sécurité et confidentialité

Il ne faut pas placer de mot de passe dans `admin/index.html` ou dans JavaScript : il serait visible par tous. Ici, l’autorisation d’écriture est réellement gérée par GitHub. Gardez donc le dépôt sous votre compte et n’accordez le droit d’écriture qu’aux personnes de confiance.

Un dépôt public reste public : un bloc marqué « non visible » n’apparaît pas sur le site, mais son texte demeure consultable dans l’historique ou les fichiers du dépôt. N’y placez aucun brouillon confidentiel ni document privé.

## Tester le site sur son ordinateur

Comme le contenu est chargé depuis un fichier JSON, il faut utiliser un petit serveur local plutôt que d’ouvrir `index.html` par double-clic :

```bash
python3 -m http.server 8000
```

Ouvrez ensuite `http://localhost:8000/`. Aucun paquet npm ni étape de compilation n’est nécessaire.

## Structure du projet

```text
.
├── .nojekyll
├── .pages.yml
├── README.md
├── index.html
├── admin/
│   └── index.html
├── assets/
│   ├── app.js
│   └── styles.css
├── content/
│   └── site.json
└── media/
    └── docs/
```
