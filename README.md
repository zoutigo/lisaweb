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

1. Duplique `.env.example` en `.env` et renseigne `DATABASE_URL` (MySQL).
2. Génère le client et applique le schéma : `npx prisma generate` puis `npx prisma migrate dev --name init` (ou `npx prisma migrate deploy` en CI/production).
3. En CI (déploiement main), ajoute le secret `DATABASE_URL` pour permettre à `prisma migrate deploy` de s’exécuter.
4. Lance l’app : `npm run dev` puis `npm run lint && npm run type-check` pour vérifier.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
