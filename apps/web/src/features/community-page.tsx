"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  apiHost,
  getCommunityFeed,
  listCollectibleKinds,
  type CollectibleKind,
  type CommunityItem
} from "../lib/api";

export function CommunityPageClient() {
  const [kinds, setKinds] = useState<CollectibleKind[]>([]);
  const [items, setItems] = useState<CommunityItem[]>([]);
  const [activeKindId, setActiveKindId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);

  useEffect(() => {
    listCollectibleKinds()
      .then((all) => setKinds(all.filter((k) => k.isActive)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getCommunityFeed(activeKindId ?? undefined)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "โหลดไม่ได้");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeKindId, fetchCount]);

  const activeKindName = kinds.find((k) => k.id === activeKindId)?.name;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <p className="text-sm font-bold text-muted-foreground">Community</p>
        <h1 className="text-3xl font-black">กองกันพลา</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ของที่นักสะสมเปิดให้ชม ไม่มีราคา ไม่มี engagement
        </p>
      </header>

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <TabButton active={activeKindId === null} onClick={() => setActiveKindId(null)}>
          ทั้งหมด
        </TabButton>
        {kinds.map((kind) => (
          <TabButton
            active={activeKindId === kind.id}
            key={kind.id}
            onClick={() => setActiveKindId(kind.id)}
          >
            {kind.name}
          </TabButton>
        ))}
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : error ? (
        <ErrorState
          error={error}
          onRetry={() => setFetchCount((c) => c + 1)}
        />
      ) : items.length === 0 ? (
        <EmptyState kindName={activeKindName} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <BuildCard item={item} key={item.id} />
          ))}
        </div>
      )}

      <footer className="mt-10 border-t border-border pt-6 text-center">
        <p className="text-sm text-muted-foreground">
          มีของ?{" "}
          <Link className="font-bold text-accent hover:underline" href="/">
            เข้า Dashboard
          </Link>{" "}
          แล้วเปิด Gallery Visibility ในโมดองที่ต้องการแชร์
        </p>
      </footer>
    </main>
  );
}

function TabButton({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex-none whitespace-nowrap rounded-md border px-3 py-1.5 text-sm font-bold transition-colors duration-150 ${
        active
          ? "border-foreground bg-foreground text-white"
          : "border-border hover:border-accent"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function BuildCard({ item }: { item: CommunityItem }) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
      {item.mainPhotoUrl ? (
        <img
          alt={item.name}
          className="aspect-square w-full object-cover"
          loading="lazy"
          src={`${apiHost}${item.mainPhotoUrl}`}
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-muted">
          <span className="text-2xl font-black text-muted-foreground">
            {item.name.charAt(0)}
          </span>
        </div>
      )}
      <div className="p-2.5">
        <p className="truncate text-sm font-bold leading-snug">{item.name}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {item.collectibleKind ? (
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">
              {item.collectibleKind.name}
            </span>
          ) : null}
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {item.state}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">@{item.ownerHandle}</p>
      </div>
    </article>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          className="overflow-hidden rounded-lg border border-border bg-white shadow-sm"
          key={i}
        >
          <div className="aspect-square w-full animate-pulse bg-muted" />
          <div className="p-2.5">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="mt-1.5 h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ kindName }: { kindName?: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-8 text-center shadow-sm">
      <p className="text-lg font-black">
        {kindName ? `ยังไม่มีกันพลา ${kindName}` : "ยังไม่มีกันพลาในตอนนี้"}
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        {kindName
          ? `นักสะสมที่มีโมดอง ${kindName} สามารถเปิด Gallery Visibility เพื่อให้แสดงที่นี่`
          : "นักสะสมสามารถเปิด Gallery Visibility ในโมดองของตัวเองเพื่อให้แสดงที่นี่"}
      </p>
    </div>
  );
}

function ErrorState({
  error,
  onRetry
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div
      aria-live="assertive"
      className="animate-fade-in rounded-lg border border-primary bg-white p-8 text-center shadow-sm"
      role="alert"
    >
      <p className="font-bold text-primary">โหลดไม่ได้</p>
      <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      <button
        className="mt-4 rounded-md border border-border px-4 py-2 text-sm font-bold hover:border-accent"
        onClick={onRetry}
        type="button"
      >
        ลองใหม่
      </button>
    </div>
  );
}
