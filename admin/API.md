# Routes API Admin LoukaTech

Toutes les routes admin privees utilisent `Authorization: Bearer <token>`.

## Auth

- `POST /api/auth/login` : connexion admin, rate limitee.
- `GET /api/auth/me` : session courante.

## Dashboard

- `GET /api/dashboard` : statistiques globales, graphiques, pays, appareils, navigateurs, connexions recentes.

## Pages

- `GET /api/pages` : liste des pages editables.
- `PUT /api/pages/:id` : modifier titre, sous-titre, description, bouton, image, sections visibles et ordre.

## Services

- `GET /api/services` : liste des services.
- `POST /api/services` : ajouter un service.
- `PUT /api/services/:id` : modifier un service.
- `DELETE /api/services/:id` : supprimer un service.

## Messages

- `POST /api/messages/public` : reception publique du formulaire contact.
- `GET /api/messages` : liste admin.
- `PATCH /api/messages/:id/status` : changer `nouveau`, `lu`, `traite`.
- `DELETE /api/messages/:id` : supprimer.

## Visiteurs

- `POST /api/visitors/track` : tracking interne public.
- `GET /api/visitors` : liste admin non publique.

## Medias

- `GET /api/media` : bibliotheque.
- `POST /api/media` : upload image multipart, champ `image`.
- `DELETE /api/media/:id` : suppression fichier + entree.

## Administrateurs

- `GET /api/admins` : liste sans hash.
- `POST /api/admins` : creation avec hash bcrypt.
- `DELETE /api/admins/:id` : suppression.

## Journal

- `GET /api/activity` : actions admin journalisees.

## Modeles

Les modeles TypeScript sont dans `server/types.ts` :

- `AdminUser`
- `SitePage`
- `Service`
- `ContactMessage`
- `Visit`
- `MediaItem`
- `Activity`
- `Database`
