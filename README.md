This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Pre-commit checks

The git hook at `.githooks/pre-commit` runs formatting (Prettier), linting, and type-checking before every commit. After cloning, point Git to the hooks folder with:

```bash
git config core.hooksPath .githooks
```

If Prettier rewrites files, the commit will stop so you can review and re-stage the changes.

## Prendre rendez-vous

- Page : `/rendezvous` (React Hook Form + Zod).
- Validation partagée : `lib/validations/rendezvous.ts`.
- API : `POST /api/rendezvous` écrit en MySQL via Prisma.
- Composants réutilisables : `components/ui/submit-button.tsx` (submit désactivé si invalide/en cours) et `components/ui/form-status.tsx` (messages succès/erreur).

## Base de données & Prisma

1. Duplique `.env.example` en `.env` et renseigne `DATABASE_URL` (MySQL) et `SHADOW_DATABASE_URL` pour Prisma.
2. Génère le client et applique le schéma : `npx prisma generate` puis `npx prisma migrate dev --name init` (ou `npx prisma migrate deploy` en CI/production).
3. En CI (déploiement main), ajoute les secrets `DATABASE_URL` (MySQL prod) et `SHADOW_DATABASE_URL` (shadow) pour permettre à `prisma migrate deploy` de s’exécuter.
4. Lance l’app : `npm run dev` puis `npm run lint && npm run type-check` pour vérifier.

### Seed des données (hors users/rdv)

La base peut être initialisée avec les offres, leurs features/steps/use-cases, et les FAQ/catégories via :

```bash
npx prisma db seed
```

Le seed ne touche pas aux tables users/rdv.

### Variables d’environnement à renseigner

- `DATABASE_URL` : connexion MySQL principale.
- `SHADOW_DATABASE_URL` : connexion MySQL pour la shadow database Prisma.
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (auth Google)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
- `MAIL_FROM`, `NOTIFY_TO`, `SITE_URL`

Ajoute aussi les variables déjà présentes dans `.env.example` en prod/CI. En CI (GitHub Actions), définis au minimum `DATABASE_URL` et `SHADOW_DATABASE_URL` dans les secrets avant `prisma migrate deploy`.

### Variables spécifiques GitHub Actions (dev-checks)

- `DATABASE_URL` (ex.: `mysql://root:root@127.0.0.1:3306/lisaweb`)
- `SHADOW_DATABASE_URL` (ex.: `mysql://root:root@127.0.0.1:3306/lisaweb_shadow`)
- (optionnel selon besoins CI) `NEXTAUTH_SECRET`, SMTP vars si tu veux tester l’envoi en CI

### Secrets requis pour les workflows GitHub (déploiement o2switch)

- `CPANEL_HOST`, `CPANEL_USER`, `CPANEL_PASSWORD` (whitelist & vérifications cPanel)
- `O2_HOST`, `O2_SSH_PORT`, `O2_SSH_USER`, `O2_SSH_KEY` (clé privée), `O2_TARGET_DIR`
- `O2_NODEENV_ACTIVATE` (commande d’activation de l’environnement node côté serveur)
- `DATABASE_URL` (utilisé pendant le déploiement pour `prisma migrate deploy`)

En CI (GitHub Actions), ajoute au minimum `DATABASE_URL` et `SHADOW_DATABASE_URL` dans les secrets avant `prisma migrate deploy`.

## Déploiement côté serveur (sans SSH entrant)

Un script serveur `scripts/deploy.sh` permet de déployer depuis le serveur (pull Git + install prod + `prisma migrate deploy` + build + restart via `tmp/restart.txt`).

Étapes :

- Sur o2switch (ou autre), cloner le repo dans le dossier cible et mettre `.env` (DATABASE_URL, etc.).
- Adapter `REPO_DIR` dans le script ou l’exporter avant exécution (`export REPO_DIR=/home/USER/nodeapps/plisa`).
- Lancer manuellement : `bash scripts/deploy.sh` (depuis le serveur), ou exposer un webhook local.
- Le restart repose sur Passenger/Node (touch `tmp/restart.txt`).
- Si les ressources sont limitées, tu peux sauter le build en définissant `SKIP_BUILD=1` (prévoir alors de livrer un bundle pré-construit).

### Webhook de déploiement (optionnel)

- Script : `scripts/deploy-webhook.js` (HTTP POST, vérification `X-Deploy-Token`).
- Secrets nécessaires côté serveur : `DEPLOY_TOKEN` (obligatoire), `REPO_DIR` (chemin du repo), `BRANCH` (par défaut `main`), `DEPLOY_PORT` (par défaut 4000).
- Démarrage : `DEPLOY_TOKEN=xxx REPO_DIR=/home/USER/nodeapps/plisa node scripts/deploy-webhook.js`.
- Appel depuis GitHub Actions (ou autre) : POST vers `https://<domaine>:<port>` avec header `X-Deploy-Token: xxx`. Le script exécute `scripts/deploy.sh`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
