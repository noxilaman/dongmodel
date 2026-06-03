"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCurrentOwner,
  getOwnerGallery,
  type GalleryItem,
  type GalleryResponse,
  type Owner
} from "../lib/api";

const apiHost =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/v1\/?$/, "") ??
  "http://localhost:4000";

export function GalleryPageClient({ handle }: { handle: string }) {
  const [viewer, setViewer] = useState<Owner | null | "loading">("loading");
  const [gallery, setGallery] = useState<GalleryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void boot();
  }, [handle]);

  async function boot() {
    const owner = await getCurrentOwner();
    setViewer(owner);

    if (!owner) return; // not logged in — render gate below

    try {
      setGallery(await getOwnerGallery(handle));
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  if (viewer === "loading") {
    return <PageShell><p className="text-sm text-muted-foreground">กำลังโหลด...</p></PageShell>;
  }

  if (!viewer) {
    return (
      <PageShell>
        <div className="rounded-lg border border-border bg-white p-8 text-center shadow-sm">
          <p className="font-black text-lg">ต้อง Login ก่อน</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Owner Gallery มองเห็นได้เฉพาะ Owner ที่ login แล้วเท่านั้น
          </p>
          <Link
            className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-black text-white"
            href="/"
          >
            ไปหน้า Login
          </Link>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <p className="text-sm font-semibold text-primary">{error}</p>
      </PageShell>
    );
  }

  if (!gallery) return null;

  return (
    <PageShell>
      <header className="mb-6">
        <p className="text-sm text-muted-foreground">@{gallery.owner.handle}</p>
        <h1 className="text-3xl font-black">{gallery.owner.displayName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {gallery.items.length} โมดอง
        </p>
      </header>

      {gallery.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">ยังไม่มีโมดองใน gallery</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {gallery.items.map((item) => (
            <GalleryCard item={item} key={item.id} />
          ))}
        </div>
      )}
    </PageShell>
  );
}

function GalleryCard({ item }: { item: GalleryItem }) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
      {item.mainPhotoUrl ? (
        <img
          alt={item.name}
          className="aspect-square w-full object-cover"
          src={`${apiHost}${item.mainPhotoUrl}`}
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-muted">
          <span className="text-xs font-bold text-muted-foreground">ไม่มีรูป</span>
        </div>
      )}
      <div className="p-3">
        <p className="truncate text-sm font-bold">{item.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{item.state}</p>
        {item.collectibleKind ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{item.collectibleKind}</p>
        ) : null}
        {item.releaseYear || item.acquisitionYear ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {[item.releaseYear, item.acquisitionYear].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <nav className="mb-6">
        <Link className="text-sm font-bold text-accent hover:underline" href="/">
          ← กลับ Dashboard
        </Link>
      </nav>
      {children}
    </main>
  );
}
