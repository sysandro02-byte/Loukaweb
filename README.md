# LoukaTech

Dépôt du site public LoukaTech et de son interface d’administration.

## Structure

- `site/` : site vitrine statique LoukaTech.
- `admin/` : application React/Vite du back-office et API Express.
- `scripts/` : outils de développement et de vérification.
- `render.yaml` : configuration de déploiement du backend sur Render.

## Commandes

```bash
npm run dev
npm run build:css
npm run admin:dev
npm run admin:build
npm run admin:test
```

Le site public est servi depuis `site/`.

## Déploiement

- Vercel : déployer le dossier `site/` avec la configuration `site/vercel.json`.
- Render : connecter ce dépôt et utiliser `render.yaml`.
- Définir `ALLOWED_ORIGINS` sur Render avec l’URL Vercel de production.

## Sécurité

- Les secrets restent dans `admin/.env` et ne doivent jamais être commit.
- Après le premier déploiement, changez le mot de passe administrateur et vérifiez les variables `JWT_SECRET` et `DATA_FILE`.
