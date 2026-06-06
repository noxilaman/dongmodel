"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Users } from "lucide-react";
import Link from "next/link";
import { listAdminUsers, type AdminUser } from "../lib/api";

export function AdminUsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setBusy(true);
    setError(null);
    try {
      setUsers(await listAdminUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-muted text-muted-foreground">
          <Users className="h-5 w-5" aria-hidden />
        </span>
        <h3 className="text-lg font-black">Admin — Manage Users</h3>
      </div>

      {error ? (
        <p className="mt-3 text-sm font-semibold text-accent">{error}</p>
      ) : null}

      {busy ? (
        <p className="mt-4 text-sm text-muted-foreground">กำลังโหลด...</p>
      ) : users.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">ไม่มี user</p>
      ) : (
        <div className="mt-4 grid gap-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5"
            >
              <div className="grid h-8 w-8 flex-none place-items-center rounded-full bg-muted text-xs font-black text-muted-foreground">
                {user.displayName[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold">{user.displayName}</p>
                  {user.role === "ADMIN" && (
                    <span className="flex-none rounded bg-primary px-1.5 py-0.5 text-[10px] font-black text-white">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  @{user.handle} · {user.email}
                </p>
              </div>
              <Link
                className="flex flex-none items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                href={`/owners/${user.handle}`}
                target="_blank"
              >
                <ExternalLink className="h-3 w-3" aria-hidden />
                Gallery
              </Link>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-right text-xs text-muted-foreground">
        {users.length} user{users.length !== 1 ? "s" : ""}
      </p>
    </section>
  );
}
