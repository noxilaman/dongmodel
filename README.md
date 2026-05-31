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

## API Auth Endpoints

Current auth foundation:

- `GET /api/v1/auth/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

Auth uses an HTTP-only `dongmodel_session` cookie. `GET /api/v1/auth/me` is protected by the shared auth guard used by future Owner-only endpoints.

## API Modong Endpoints

Current Modong foundation:

- `GET /api/v1/modong`
- `GET /api/v1/modong/:id`
- `POST /api/v1/modong`
- `PATCH /api/v1/modong/:id`
- `DELETE /api/v1/modong/:id`

All Modong endpoints require the Owner session cookie and only operate on the current Owner's Modong.

## API Wanted Endpoints

Current Wanted Item foundation:

- `GET /api/v1/wanted`
- `GET /api/v1/wanted/:id`
- `POST /api/v1/wanted`
- `PATCH /api/v1/wanted/:id`
- `DELETE /api/v1/wanted/:id`

All Wanted endpoints require the Owner session cookie and only operate on the current Owner's Wanted Items. Creating or updating a Wanted Item to `mission complete` creates a Modong immediately with Modong State `โมดอง`.

## Development Checks

Run these before considering a change complete:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

New domain or service behavior should include unit tests. Database-backed behavior should use separate integration tests when a test database is introduced.

See [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) for the full workflow.
