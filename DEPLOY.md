# Deploy Dongmodel

This guide describes how to deploy the current Dongmodel scaffold:

- `apps/web`: Next.js frontend
- `apps/api`: NestJS backend API
- `packages/shared`: shared domain constants and Zod schemas
- MySQL database
- Prisma ORM
- Local image storage for the first version

## Requirements

- Node.js 25 or compatible current Node runtime
- pnpm 11
- MySQL 8
- A persistent directory for uploaded images
- HTTPS-capable reverse proxy or hosting platform

## Environment

Create production environment files from the examples:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

API environment:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/dongmodel"
WEB_ORIGIN="https://your-web-domain.example"
PORT="4000"
SESSION_SECRET="replace-with-a-long-random-secret"
IMAGE_STORAGE_DRIVER="local"
LOCAL_UPLOAD_DIR="/var/lib/dongmodel/uploads"
```

Web environment:

```env
NEXT_PUBLIC_API_BASE_URL="https://your-api-domain.example/api/v1"
```

Use a long random value for `SESSION_SECRET`. Do not reuse the example value.

## Build

Install dependencies:

```bash
pnpm install
```

Generate Prisma Client:

```bash
pnpm --filter @dongmodel/api prisma:generate
```

Build all packages:

```bash
pnpm build
```

## Database

Create the MySQL database:

```sql
CREATE DATABASE dongmodel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Run migrations locally during development:

```bash
pnpm --filter @dongmodel/api prisma:migrate
```

For production deployment, use:

```bash
pnpm --filter @dongmodel/api exec prisma migrate deploy
```

Seed initial administrator-managed options:

```bash
pnpm --filter @dongmodel/api prisma:seed
```

## Image Storage

The first version stores uploaded images locally.

Create the upload directory on the API host:

```bash
mkdir -p /var/lib/dongmodel/uploads
```

Make sure the API process can read and write that directory.

Back up this directory together with the MySQL database. Modong photos, additional photos, and wanted reference photos are product data.

The storage boundary should later allow switching `IMAGE_STORAGE_DRIVER` to an S3-compatible driver without changing the domain model.

## Run

Start the API:

```bash
pnpm --filter @dongmodel/api start
```

Start the web app:

```bash
pnpm --filter @dongmodel/web start
```

Expected ports:

- Web: `3000`
- API: `4000`

Put both behind HTTPS in production.

## Reverse Proxy

Recommended public routing:

- `https://dongmodel.example` -> Next.js web app on port `3000`
- `https://api.dongmodel.example` -> NestJS API on port `4000`

The API must allow CORS from `WEB_ORIGIN`.

Cookie-based auth requires HTTPS in production. Configure cookies as secure and same-site according to the final domain layout during auth implementation.

## Health Checks

Current scaffold endpoints:

```text
GET /api/v1/auth/health
GET /api/v1/modong
GET /api/v1/wanted
GET /api/v1/admin/collectible-kinds
```

Use `GET /api/v1/auth/health` as the basic API process health check for now.

## Deployment Checklist

- MySQL database exists.
- `DATABASE_URL` points to the production database.
- `SESSION_SECRET` is strong and private.
- `WEB_ORIGIN` matches the deployed web origin.
- `NEXT_PUBLIC_API_BASE_URL` points to the deployed API.
- Upload directory exists and is writable by the API process.
- Upload directory is backed up.
- `pnpm --filter @dongmodel/api prisma:generate` has run.
- `pnpm build` passes.
- Prisma migrations have been applied.
- Web and API are served over HTTPS.

## Rollback

For app rollback:

1. Stop the current web and API processes.
2. Deploy the previous build artifact or previous git revision.
3. Restart API and web.
4. Verify `GET /api/v1/auth/health`.

For database rollback, restore from a MySQL backup. Do not assume Prisma migrations are automatically reversible in production.

For image rollback, restore the upload directory backup that matches the database backup.
