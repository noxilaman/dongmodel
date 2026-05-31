# Dongmodel

Thai-first web app for collectors to record Modong, track Wanted Items, and share public cards without exposing prices or storage notes.

## Workspace

- `apps/web`: Next.js frontend
- `apps/api`: NestJS backend API
- `packages/shared`: shared Zod schemas and domain constants
- `docs`: MVP notes and ADRs

## First Run

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
pnpm dev
```

The API is intended to run on `http://localhost:4000` and the web app on `http://localhost:3000`. The API expects a MySQL database matching `DATABASE_URL`.

After MySQL is available:

```bash
pnpm --filter @dongmodel/api prisma:migrate
pnpm --filter @dongmodel/api prisma:seed
```

To preview only the frontend shell:

```bash
pnpm --filter @dongmodel/web dev
```
