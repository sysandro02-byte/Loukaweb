# Espace Admin LoukaTech

Admin React + TypeScript + Tailwind avec API Express pour gerer le contenu, les services, les messages, les medias, les statistiques visiteurs, les administrateurs et le journal d'activite.

## Installation

```bash
cd admin
npm install
npm run seed
npm run dev
```

Frontend dev : `http://localhost:5174`
Frontend preview : `http://localhost:4174`
API : `http://localhost:5175`

Compte de demo apres seed :

- Email : `admin@loukatech.com`
- Mot de passe : `ChangeMe!2026`

Changez ce mot de passe et `JWT_SECRET` avant production.

## Variables d'environnement

```bash
JWT_SECRET=une_valeur_longue_et_secrete
ADMIN_ORIGIN=https://admin.loukatech.com
API_PORT=5175
VITE_API_URL=https://api.loukatech.com
AI_API_KEY=sk-...
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-4o-mini
```

## Fonctionnement

- Auth admin par JWT, mot de passe hashe avec bcrypt.
- Limitation des tentatives de connexion.
- Roles : `super_admin`, `editor`, `moderator`, `readonly`.
- Routes protegees par permission cote API et cote interface.
- Donnees stockees dans `server/data/db.json` pour demarrer vite.
- Uploads images stockes dans `server/uploads`.
- Tracking public via `/api/visitors/track`.
- Formulaire contact public via `/api/messages/public`.
- Chatbot Heaven via `/api/heaven/chat`.
- Les routes admin Heaven sont protegees sous `/api/admin/heaven/*`.
- Sans `AI_API_KEY`, Heaven repond avec un fallback local LoukaTech. Avec `AI_API_KEY`, la cle reste cote serveur uniquement.

## Migration base de donnees

La couche `server/utils/storage.ts` centralise les lectures/ecritures. Pour passer a PostgreSQL, MongoDB ou Supabase, remplacez cette couche par des requetes DB et conservez les routes.

## Securite production

- Definir un `JWT_SECRET` fort.
- Servir l'API en HTTPS.
- Restreindre `ADMIN_ORIGIN`.
- Brancher une vraie base de donnees avec sauvegardes.
- Ajouter CSRF si les tokens passent en cookies. Ici le token est envoye en header `Authorization`.
- Ajouter une politique de retention pour les visites.
- Eviter d'exposer les donnees visiteurs publiquement.

## Test rapide

```bash
npm run seed
npm run dev
```

1. Ouvrir `http://localhost:5174/login`.
2. Se connecter avec le compte de demo.
3. Verifier le dashboard, modifier une page, ajouter un service.
4. Uploader une image.
5. Envoyer un message depuis le formulaire public si l'API est disponible sur le meme domaine ou via `window.LOUKATECH_API_URL`.

## Preview production locale

```bash
npm run seed
npm run build
npm run preview
```

`npm run preview` lance un serveur Express unique qui sert l'API et le frontend compile. Ouvrez ensuite `http://localhost:4174/login`.

## Tester Heaven

```bash
npm run seed
npm run build
npm run preview
```

1. Ouvrir `http://localhost:4174/login`.
2. Aller dans `Heaven IA`.
3. Modifier le prompt, les FAQ ou le numero WhatsApp.
4. Ouvrir le site public servi sur le meme domaine ou definir `window.LOUKATECH_API_URL` vers l'API admin.
5. Poser une question au widget Heaven.

Pour brancher une IA, ajoutez `AI_API_KEY`. `AI_API_URL` est compatible avec une API de chat type OpenAI. Ne mettez jamais la cle dans le frontend.
