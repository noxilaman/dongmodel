# Dongmodel — Progress

Tracks what has been implemented versus what remains, by area.

---

## Backend API

### Auth — ✅ Done
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/auth/health`
- HTTP-only session cookie (`dongmodel_session`)
- Unit tests: ✅

### Modong CRUD — ✅ Done
- `GET /api/v1/modong` — list, with search + filters
- `GET /api/v1/modong/:id`
- `POST /api/v1/modong`
- `PATCH /api/v1/modong/:id`
- `DELETE /api/v1/modong/:id`
- State mapper (Thai states ↔ Prisma enum)
- Unit tests: ✅

### Wanted Item CRUD — ✅ Done
- `GET /api/v1/wanted`
- `GET /api/v1/wanted/:id`
- `POST /api/v1/wanted`
- `PATCH /api/v1/wanted/:id`
- `DELETE /api/v1/wanted/:id`
- `mission complete` state immediately creates a Modong with state `โมดอง`
- State mapper: ✅
- Unit tests: ✅

### Photo Upload — ✅ Done
- `POST /api/v1/modong/:id/photos/main` — replace Main Photo
- `POST /api/v1/modong/:id/photos/additional` — add Additional Photo (max 5 enforced)
- `POST /api/v1/wanted/:id/photos/reference` — replace Wanted Reference Photo
- `DELETE /api/v1/photos/:id`
- Local file storage with S3-compatible path (ADR-006)
- Static file serving at `/uploads/:storageKey` (via Express static middleware in `main.ts`)
- Photo DTO includes `url` field (`/uploads/<storageKey>`)
- Wanted Item list response includes `referencePhoto` (`id` + `url`) when present
- Unit tests: ✅

### Modong Groups — ✅ Done
- `GET /api/v1/modong-groups`
- `GET /api/v1/modong-groups/:id` (includes member Modong)
- `POST /api/v1/modong-groups`
- `PATCH /api/v1/modong-groups/:id`
- `DELETE /api/v1/modong-groups/:id`
- `POST /api/v1/modong-groups/:id/items`
- `DELETE /api/v1/modong-groups/:id/items/:modongId`
- Unit tests: ✅

### Wanted Lists — ✅ Done
- `GET /api/v1/wanted-lists`
- `GET /api/v1/wanted-lists/:id`
- `POST /api/v1/wanted-lists`
- `PATCH /api/v1/wanted-lists/:id`
- `DELETE /api/v1/wanted-lists/:id`
- Unit tests: ✅

### Owner Summary — ✅ Done
- `GET /api/v1/owner-summary`
- Modong counts per state (zero-filled)
- Wanted Item counts per state (zero-filled)
- Private purchase/release value totals grouped by currency
- Unit tests: ✅

### Share — ✅ Done
- `GET /api/v1/shares/:token` — public, returns typed payload per kind (MODONG / MODONG_GROUP / WANTED)
- `POST /api/v1/shares` — owner auth, accepts `{ kind, modongId | modongGroupId | wantedItemId }`, returns `{ token }`
- `DELETE /api/v1/shares/:token` — owner auth, revokes share
- Token stored as SHA-256 hash; plain token returned only on creation (ADR-003)
- Re-creating share for same target auto-revokes the old one
- WANTED share only served when state = `กำลังงมเข็ม`; returns 403 otherwise
- Unit tests: ✅ (7 tests)

### Owner Gallery — 🟡 Stub only
- `GET /api/v1/owners/:handle/gallery` — returns `{ owner, items: [] }`
- Missing: Gallery Visibility filter, Owner Handle lookup, authenticated-only guard

### Admin (Collectible Kinds) — ✅ Done
- `GET /api/v1/admin/collectible-kinds` — public, used by forms to populate selector
- `POST /api/v1/admin/collectible-kinds` — Admin only
- `PATCH /api/v1/admin/collectible-kinds/:id` — Admin only (rename + toggle isActive)
- `DELETE /api/v1/admin/collectible-kinds/:id` — Admin only
- AdminGuard checks `owner.role === "ADMIN"`, built on top of AuthGuard
- Default kinds seeded via `prisma:seed` (Gunpla, Figure, Board Game, Toy, Model Kit, Book/Manga, Game, อื่น ๆ)
- Unit tests: ✅

---

## Frontend (Next.js)

### Auth — ✅ Done
- Login form
- Register form (email, password, Display Name, Handle)
- Logout
- Session check on page load

### Owner Summary Dashboard — ✅ Done
- Metric cards: ของที่มีในมือ, โมดองทั้งหมด, ของที่ตามหา
- Modong state breakdown panel
- Wanted Item state breakdown panel
- Private value summary (purchase/release totals)

### Modong — ✅ Done (full CRUD + photos)
- Create form: name, state, collectible kind, release year, acquisition year, purchase price, storage note, private note
- After create: pending photo banner for Main Photo upload
- `ModongListPanel`: list all Modong, edit inline (all fields), delete
- Main Photo upload (replace), Additional Photos upload (max 5) + delete per photo
- Modong DTO now includes `mainPhoto`, `additionalPhotos` from backend

### Wanted Items — ✅ Done (full CRUD + reference photo + list assignment)
- Create form: name, state, collectible kind, private note
- After create: pending photo banner for Wanted Reference Photo
- List panel: reference photo thumbnail + delete, inline state dropdown, delete
- Wanted List assignment handled via `WantedListsPanel`
- `mission complete` creates Modong automatically (server-side)
- Wanted Item DTO now includes `wantedListId` from backend

### Modong Groups UI — ✅ Done
- List all groups with item count
- Create, edit (rename + note), delete
- Detail view: show members, remove member, add unassigned Modong

### Wanted Lists UI — ✅ Done
- List all lists with item count
- Create list, rename list, delete list
- Detail view: show members, remove item, add unassigned Wanted Items
- Implemented as `WantedListsPanel` component (`features/wanted-lists.tsx`)

### Gallery UI — ❌ Not started
- Owner Gallery page (`/owners/:handle`)

### Share UI — ✅ Done
- `ShareButton` component — กด → สร้าง token → แสดง URL พร้อม copy button (dismiss ได้)
- ปุ่ม Share ใน ModongListPanel (ทุก item), WantedItemsPanel (เฉพาะ กำลังงมเข็ม), ModongGroupsPanel (detail view)
- `/s/[token]` — Next.js page (server component) fetch share data แล้ว render ผ่าน `SharePageClient`
  - **Share Card** (MODONG): main photo, name, state, kind, years, owner display name
  - **Group Share Card** (MODONG_GROUP): 5-photo grid header, group name, member list พร้อม photo thumbnails
  - **Wanted Share** (WANTED): reference photo, name, phrase "อยากรับมาเลี้ยงดู"
  - **Not Found** page เมื่อ token ไม่มีหรือถูก revoke
- ทุก public page ไม่แสดงราคา, Storage Note, Private Note, Group Note, Wanted Note

### Admin UI — ✅ Done
- `AdminKindsPanel` แสดงเฉพาะ owner.role === "ADMIN"
- เพิ่มประเภทใหม่, แก้ไขชื่อ inline, toggle เปิด/ปิด, ลบ
- `CollectibleKindSelector` — reusable component โหลด active kinds จาก API, ใช้ใน Modong form และ Wanted form

---

## Infrastructure / Shared

| Area | Status |
|------|--------|
| pnpm monorepo setup | ✅ Done |
| Shared Zod schemas (`packages/shared`) | ✅ Done |
| Domain constants (`modongStates`, `wantedStates`, `publicPhrases`) | ✅ Done |
| Prisma schema + migrations | ✅ Done |
| Prisma seed | ✅ Done |
| Local image storage | ✅ Done |
| HTTP-only session cookies | ✅ Done |
| Tailwind + shadcn/ui baseline | ✅ Done |
| Quality gate (`test`, `typecheck`, `lint`, `build`) | ✅ All passing |

---

## What's Next (suggested order)

1. **Owner Gallery** — backend service + `/owners/:handle` page (authenticated-only, handle lookup, Gallery Visibility filter)
