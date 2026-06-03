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

To bootstrap admin users during development or first deploy, register the user normally, set `ADMIN_EMAILS` in `apps/api/.env`, then run seed again:

```env
ADMIN_EMAILS="owner@example.com,another@example.com"
```

```bash
pnpm --filter @dongmodel/api prisma:seed
```

Any matching Owner email is promoted to `ADMIN`. Emails that do not exist yet are skipped and printed in the seed log.

To preview only the frontend shell:

```bash
pnpm --filter @dongmodel/web dev
```

The frontend provides a full Owner dashboard split across dedicated pages: `/` for overview, `/modong` for Modong CRUD + photos, `/wanted` for Wanted Items CRUD + photos, `/groups` for Modong Groups, `/wanted-lists` for Wanted Lists, and `/admin` for Admin-only Collectible Kind management. Public share pages live at `/s/[token]`, and Owner Gallery lives at `/owners/[handle]` (login required).

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

## API Photo Endpoints

Current photo foundation:

- `POST /api/v1/modong/:id/photos/main`
- `POST /api/v1/modong/:id/photos/additional`
- `POST /api/v1/wanted/:id/photos/reference`
- `DELETE /api/v1/photos/:id`

All photo endpoints require the Owner session cookie. Uploads use multipart form data with a `file` field. Main Photo and Wanted Reference Photo are replaced when uploaded again. Additional Photos are limited to five per Modong.

## API Organization Endpoints

Current Modong Group foundation:

- `GET /api/v1/modong-groups`
- `GET /api/v1/modong-groups/:id`
- `POST /api/v1/modong-groups`
- `PATCH /api/v1/modong-groups/:id`
- `DELETE /api/v1/modong-groups/:id`
- `POST /api/v1/modong-groups/:id/items`
- `DELETE /api/v1/modong-groups/:id/items/:modongId`

Current Wanted List foundation:

- `GET /api/v1/wanted-lists`
- `GET /api/v1/wanted-lists/:id`
- `POST /api/v1/wanted-lists`
- `PATCH /api/v1/wanted-lists/:id`
- `DELETE /api/v1/wanted-lists/:id`

Modong may belong to multiple Modong Groups. Wanted Items belong to one Wanted List through their `wantedListId` field.

## API Share Endpoints

- `GET /api/v1/shares/:token` — public, returns Share Card / Group Share Card / Wanted Share payload
- `POST /api/v1/shares` — owner auth, body `{ kind, modongId | modongGroupId | wantedItemId, featuredModongIds? }`, returns `{ token }`
- `DELETE /api/v1/shares/:token` — owner auth, revokes share

## API Gallery Endpoint

- `GET /api/v1/owners/:handle/gallery` — requires session cookie, returns gallery-eligible Modong for the given handle

## API Admin Endpoints

- `GET /api/v1/admin/collectible-kinds` — public
- `POST /api/v1/admin/collectible-kinds` — Admin role only
- `PATCH /api/v1/admin/collectible-kinds/:id` — Admin role only
- `DELETE /api/v1/admin/collectible-kinds/:id` — Admin role only

## API Summary Endpoint

Current private Owner Summary foundation:

- `GET /api/v1/owner-summary`

The summary endpoint requires the Owner session cookie. It returns Modong counts by state, Wanted Item counts by state, total counts, and Owner-only purchase/release value summaries grouped by currency. Value summaries are private API data and are not exposed by public share links or gallery surfaces.

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
