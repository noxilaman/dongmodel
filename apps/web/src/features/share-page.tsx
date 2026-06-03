"use client";

import Link from "next/link";
import {
  type ShareGroupPayload,
  type ShareModongPayload,
  type SharePayload,
  type ShareWantedPayload
} from "../lib/api";

const apiHost =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/v1\/?$/, "") ??
  "http://localhost:4000";

function photoUrl(url: string | null): string | null {
  return url ? `${apiHost}${url}` : null;
}

export function SharePageClient({
  notFound,
  payload
}: {
  notFound: boolean;
  payload: SharePayload | null;
}) {
  if (notFound || !payload) {
    return <NotFoundCard />;
  }

  switch (payload.kind) {
    case "MODONG":
      return <ModongCard payload={payload} />;
    case "MODONG_GROUP":
      return <GroupCard payload={payload} />;
    case "WANTED":
      return <WantedCard payload={payload} />;
  }
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">{children}</div>
    </main>
  );
}

function Footer() {
  return (
    <p className="mt-6 text-center text-xs text-muted-foreground">
      <Link className="hover:underline" href="/">
        Dongmodel
      </Link>{" "}
      — จัดกองโมดอง ของที่ตามหา แชร์ความสุลต่านแบบไม่โชว์ราคา
    </p>
  );
}

function ModongCard({ payload }: { payload: ShareModongPayload }) {
  const { modong } = payload;
  const img = photoUrl(modong.mainPhotoUrl);

  return (
    <PageShell>
      <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-md">
        {img ? (
          <img
            alt={modong.name}
            className="h-64 w-full object-cover"
            src={img}
          />
        ) : (
          <DefaultLogo />
        )}
        <div className="p-6">
          <p className="text-sm font-semibold text-muted-foreground">
            {modong.ownerDisplayName}
          </p>
          <h1 className="mt-1 text-2xl font-black">{modong.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Tag>{modong.state}</Tag>
            {modong.collectibleKind ? <Tag>{modong.collectibleKind}</Tag> : null}
            {modong.releaseYear ? <Tag>ปีที่ออก {modong.releaseYear}</Tag> : null}
            {modong.acquisitionYear ? (
              <Tag>ได้มาปี {modong.acquisitionYear}</Tag>
            ) : null}
          </div>
        </div>
      </article>
      <Footer />
    </PageShell>
  );
}

function GroupCard({ payload }: { payload: ShareGroupPayload }) {
  const { group } = payload;

  return (
    <PageShell>
      <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-md">
        {/* Featured photos grid */}
        {group.featuredPhotos.length > 0 ? (
          <div className="grid grid-cols-5 gap-0.5 bg-muted">
            {Array.from({ length: 5 }).map((_, i) => {
              const url = group.featuredPhotos[i]
                ? `${apiHost}${group.featuredPhotos[i]}`
                : null;
              return url ? (
                <img
                  alt=""
                  className="aspect-square w-full object-cover"
                  key={i}
                  src={url}
                />
              ) : (
                <div
                  className="aspect-square w-full bg-muted"
                  key={i}
                />
              );
            })}
          </div>
        ) : (
          <DefaultLogo />
        )}
        <div className="p-6">
          <p className="text-sm font-semibold text-muted-foreground">
            {group.ownerDisplayName}
          </p>
          <h1 className="mt-1 text-2xl font-black">{group.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {group.totalCount} โมดอง
          </p>
          <div className="mt-4 grid gap-2">
            {group.modong.map((m) => (
              <div
                className="flex items-center gap-3 rounded-md border border-border p-2"
                key={m.id}
              >
                {m.mainPhotoUrl ? (
                  <img
                    alt={m.name}
                    className="h-10 w-10 flex-none rounded object-cover"
                    src={`${apiHost}${m.mainPhotoUrl}`}
                  />
                ) : (
                  <div className="grid h-10 w-10 flex-none place-items-center rounded bg-muted text-xs text-muted-foreground">
                    —
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.state}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
      <Footer />
    </PageShell>
  );
}

function WantedCard({ payload }: { payload: ShareWantedPayload }) {
  const { wanted } = payload;
  const img = photoUrl(wanted.referencePhotoUrl);

  return (
    <PageShell>
      <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-md">
        {img ? (
          <img
            alt={wanted.name}
            className="h-64 w-full object-cover"
            src={img}
          />
        ) : (
          <DefaultLogo />
        )}
        <div className="p-6">
          <p className="text-sm font-semibold text-muted-foreground">
            {wanted.ownerDisplayName}
          </p>
          <h1 className="mt-1 text-2xl font-black">{wanted.name}</h1>
          <p className="mt-3 text-lg font-black text-accent">{wanted.phrase}</p>
        </div>
      </article>
      <Footer />
    </PageShell>
  );
}

function NotFoundCard() {
  return (
    <PageShell>
      <article className="rounded-2xl border border-border bg-white p-8 text-center shadow-md">
        <p className="text-lg font-black">ลิงก์นี้ไม่มีอยู่แล้ว</p>
        <p className="mt-2 text-sm text-muted-foreground">
          อาจถูกเจ้าของยกเลิกไปแล้ว หรือ URL ไม่ถูกต้อง
        </p>
      </article>
      <Footer />
    </PageShell>
  );
}

function DefaultLogo() {
  return (
    <div className="flex h-56 items-center justify-center bg-white">
      <img
        alt="Dongmodel"
        className="h-44 w-44 object-contain"
        src="/brand/logo.png"
      />
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
      {children}
    </span>
  );
}
