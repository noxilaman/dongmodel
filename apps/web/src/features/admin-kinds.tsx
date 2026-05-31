"use client";

import { useEffect, useState } from "react";
import { Plus, Settings, Trash2 } from "lucide-react";
import {
  createCollectibleKind,
  deleteCollectibleKind,
  listCollectibleKinds,
  updateCollectibleKind,
  type CollectibleKind
} from "../lib/api";

export function AdminKindsPanel() {
  const [kinds, setKinds] = useState<CollectibleKind[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      setKinds(await listCollectibleKinds());
    } catch (err) {
      setError(msg(err));
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await createCollectibleKind(newName.trim());
      setNewName("");
      await load();
    } catch (err) {
      setError(msg(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleActive(kind: CollectibleKind) {
    setBusy(true);
    setError(null);
    try {
      await updateCollectibleKind(kind.id, { isActive: !kind.isActive });
      await load();
    } catch (err) {
      setError(msg(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!editId || !editName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await updateCollectibleKind(editId, { name: editName.trim() });
      setEditId(null);
      setEditName("");
      await load();
    } catch (err) {
      setError(msg(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    setBusy(true);
    setError(null);
    try {
      await deleteCollectibleKind(id);
      await load();
    } catch (err) {
      setError(msg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-muted text-accent">
          <Settings className="h-5 w-5" aria-hidden />
        </span>
        <h3 className="text-lg font-black">Admin — Collectible Kinds</h3>
      </div>

      {error ? (
        <p className="mt-3 text-sm font-semibold text-primary">{error}</p>
      ) : null}

      {/* Add new kind */}
      <form className="mt-4 flex gap-2" onSubmit={handleCreate}>
        <input
          className="h-10 flex-1 rounded-md border border-border px-3 text-sm outline-none focus:border-accent"
          disabled={busy}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="ชื่อประเภทใหม่"
          type="text"
          value={newName}
        />
        <button
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-black text-white disabled:opacity-60"
          disabled={busy || !newName.trim()}
          type="submit"
        >
          <Plus className="h-4 w-4" aria-hidden />
          เพิ่ม
        </button>
      </form>

      {/* Kind list */}
      <div className="mt-4 grid gap-2">
        {kinds.map((kind) => (
          <div
            className={`flex items-center gap-3 rounded-md border px-3 py-2 ${
              kind.isActive ? "border-border" : "border-border bg-muted opacity-60"
            }`}
            key={kind.id}
          >
            {editId === kind.id ? (
              <form className="flex flex-1 gap-2" onSubmit={handleRename}>
                <input
                  autoFocus
                  className="h-8 flex-1 rounded border border-border px-2 text-sm outline-none focus:border-accent"
                  disabled={busy}
                  onChange={(e) => setEditName(e.target.value)}
                  type="text"
                  value={editName}
                />
                <button
                  className="rounded bg-primary px-2 py-1 text-xs font-black text-white disabled:opacity-60"
                  disabled={busy || !editName.trim()}
                  type="submit"
                >
                  บันทึก
                </button>
                <button
                  className="rounded border border-border px-2 py-1 text-xs font-bold"
                  onClick={() => setEditId(null)}
                  type="button"
                >
                  ยกเลิก
                </button>
              </form>
            ) : (
              <>
                <span className="flex-1 text-sm font-bold">{kind.name}</span>
                <button
                  className="text-xs font-semibold text-muted-foreground hover:text-accent disabled:opacity-40"
                  disabled={busy}
                  onClick={() => {
                    setEditId(kind.id);
                    setEditName(kind.name);
                  }}
                  type="button"
                >
                  แก้ไข
                </button>
                <button
                  className="text-xs font-semibold text-muted-foreground hover:text-accent disabled:opacity-40"
                  disabled={busy}
                  onClick={() => handleToggleActive(kind)}
                  type="button"
                >
                  {kind.isActive ? "ปิด" : "เปิด"}
                </button>
                <button
                  aria-label={`ลบ ${kind.name}`}
                  className="grid h-7 w-7 flex-none place-items-center rounded border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-40"
                  disabled={busy}
                  onClick={() => handleDelete(kind.id)}
                  type="button"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function msg(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}
