# Dongmodel — Claude Code Guide

## Project Overview

Dongmodel is a Thai-first web app for collectors to record **Modong** (acquired collectibles), track **Wanted Items**, and share public cards without exposing prices or private notes.

**Monorepo layout (pnpm workspaces):**

| Path | Package | Role |
|------|---------|------|
| `apps/web` | `@dongmodel/web` | Next.js 15 frontend |
| `apps/api` | `@dongmodel/api` | NestJS backend API |
| `packages/shared` | `@dongmodel/shared` | Zod schemas + domain constants |

---

## Domain Language (use these exact terms in code and docs)

All terms come from `CONTEXT.md`. Key ones:

| Term | Thai | Meaning |
|------|------|---------|
| Modong | โมดอง | One acquired collectible unit |
| Wanted Item | ของที่ตามหา | Collectible the Owner is looking for |
| Owner | — | Person who manages their own Modong/Wanted Items |
| Modong State | — | Lifecycle state of a Modong |
| Wanted State | — | Search state of a Wanted Item |
| Modong Group | — | Owner-defined group of Modong (many-to-many) |
| Wanted List | — | Owner-defined group of Wanted Items (one list per item) |
| Share Card | — | Public single-Modong share |
| Group Share Card | — | Public Modong Group share |
| Wanted Share | — | Public share for a Needle Hunting Wanted Item |

**Modong States** (from `packages/shared/src/domain.ts`):
- `โมดอง` — default acquired state
- `ต่อไม่เสร็จ` — Unfinished Modong
- `ต่อแล้ว` — Completed Modong
- `ปล่อยไปแล้ว` — Released Modong
- `หลุมดำ` — Black Hole Modong

**Wanted States:**
- `กำลังงมเข็ม` — Needle Hunting (default)
- `mission complete` — triggers immediate Modong creation
- `ห่างกันซักพัก` — Taking A Break
- `เราขาดกัน` — Broken Up

**Public phrases (never modify without updating `CONTEXT.md`):**
- Wanted Share: `"อยากรับมาเลี้ยงดู"`
- Mission Complete / Adopted In: `"ได้รับมาเลี้ยงดูแล้ว"`
- Released / Adopted Forward: `"มีคนรับไปเลี้ยงดูต่อแล้ว"`

---

## Tech Stack

**Backend (`apps/api`):** NestJS · Prisma · MySQL · HTTP-only session cookies (`dongmodel_session`) · REST API at `/api/v1/...`

**Frontend (`apps/web`):** Next.js 15 · Tailwind CSS · shadcn/ui · `NEXT_PUBLIC_API_BASE_URL` for API calls

**Shared (`packages/shared`):** Zod schemas (`schemas.ts`) · domain constants (`domain.ts`) — build before running tests or typecheck

---

## Common Commands

```bash
# Development (builds shared first, then runs web + api in parallel)
pnpm dev

# Quality gate — must all pass before a change is done
pnpm test
pnpm typecheck
pnpm lint
pnpm build

# Database (run when changing Prisma schema)
DATABASE_URL=mysql://dongmodel:dongmodel@localhost:3306/dongmodel pnpm --filter @dongmodel/api exec prisma validate
pnpm --filter @dongmodel/api prisma:generate
pnpm --filter @dongmodel/api prisma:migrate
pnpm --filter @dongmodel/api prisma:seed

# Frontend only (no API needed)
pnpm --filter @dongmodel/web dev
```

---

## API Endpoints Summary

**Auth** (`/api/v1/auth/...`): `health`, `register`, `login`, `logout`, `me`

**Modong** (`/api/v1/modong/...`): CRUD — all require session cookie, Owner-scoped only

**Wanted Items** (`/api/v1/wanted/...`): CRUD — `mission complete` state immediately creates a Modong

**Photos:**
- `POST /api/v1/modong/:id/photos/main` — replaces Main Photo
- `POST /api/v1/modong/:id/photos/additional` — adds Additional Photo (max 5)
- `POST /api/v1/wanted/:id/photos/reference` — replaces Wanted Reference Photo
- `DELETE /api/v1/photos/:id`

**Organization:**
- Modong Groups: `/api/v1/modong-groups/...` + membership via `/items`
- Wanted Lists: `/api/v1/wanted-lists/...`

**Summary:** `GET /api/v1/owner-summary` — private Owner-only counts + value totals

---

## Key Business Rules

1. **No quantity fields** — each collectible is one record.
2. **Mission complete → Modong** — setting Wanted State to `mission complete` immediately creates a Modong with state `โมดอง`.
3. **Public shares never expose**: purchase prices, release prices, Storage Notes, Private Notes, Group Notes, Wanted Notes.
4. **Owner Gallery** — logged-in only; shows `โมดอง`, `ต่อไม่เสร็จ`, `ต่อแล้ว` with Gallery Visibility on; never shows Released or Black Hole Modong.
5. **Share tokens are random** — not derived from Owner handle or item name.
6. **Photos**: Main Photo = one per Modong; Additional Photos = up to 5; Wanted Reference Photo = one per Wanted Item. All enforced in the backend.
7. **Minimal Modong**: only Modong Name + Modong State required.
8. **Minimal Wanted Item**: only Wanted Name + Wanted State required.

---

## Testing Conventions

- **Unit tests**: mock Prisma, test service-level business rules.
- **Integration tests**: use a real database only when behavior depends on MySQL/Prisma/cookies/file storage.
- **Shared schemas**: test defaults, normalization, and rejected invalid input.
- **Frontend**: component/interaction tests when flows become stateful; build/typecheck for static shells.
- Build `@dongmodel/shared` before running tests anywhere: `pnpm --filter @dongmodel/shared build`.

---

## Documentation Map

| File | What goes here |
|------|---------------|
| `CONTEXT.md` | Domain glossary only — terms and resolved language |
| `docs/MVP.md` | Product scope, rules, MVP behavior |
| `docs/adr/` | Hard-to-reverse architectural decisions |
| `DEPLOY.md` | Deployment, env vars, migrations, storage |
| `README.md` | Quick-start and day-to-day dev commands |
| `docs/DEVELOPMENT.md` | Team workflow, testing policy, local conventions |

Do **not** put implementation specs or test policy in `CONTEXT.md`.

---

## Definition of Done

A change is complete only when:

- [ ] Relevant unit tests added/updated
- [ ] Relevant documentation updated
- [ ] `pnpm test` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes
