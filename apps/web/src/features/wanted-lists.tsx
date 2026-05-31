"use client";

import { useEffect, useState } from "react";
import { List, Plus, Trash2, X } from "lucide-react";
import {
  createWantedList,
  deleteWantedList,
  listWantedItems,
  listWantedLists,
  updateWantedItem,
  updateWantedList,
  type WantedItem,
  type WantedList
} from "../lib/api";

type View = { kind: "list" } | { kind: "detail"; listId: string; listName: string };

export function WantedListsPanel() {
  const [lists, setLists] = useState<WantedList[]>([]);
  const [allWanted, setAllWanted] = useState<WantedItem[]>([]);
  const [view, setView] = useState<View>({ kind: "list" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    void loadAll();
  }, []);

  async function loadAll() {
    try {
      const [ls, wi] = await Promise.all([listWantedLists(), listWantedItems()]);
      setLists(ls);
      setAllWanted(wi);
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
      await createWantedList(newName.trim());
      setNewName("");
      await loadAll();
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
      await updateWantedList(editId, editName.trim());
      setEditId(null);
      setEditName("");
      await loadAll();
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
      await deleteWantedList(id);
      if (view.kind === "detail" && view.listId === id) setView({ kind: "list" });
      await loadAll();
    } catch (err) {
      setError(msg(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleAssign(wantedId: string, listId: string | null) {
    setBusy(true);
    setError(null);
    try {
      await updateWantedItem(wantedId, { wantedListId: listId ?? undefined });
      await loadAll();
    } catch (err) {
      setError(msg(err));
    } finally {
      setBusy(false);
    }
  }

  const currentMembers =
    view.kind === "detail"
      ? allWanted.filter((w) => (w as WantedItemWithList).wantedListId === view.listId)
      : [];
  const unassigned = allWanted.filter((w) => !(w as WantedItemWithList).wantedListId);

  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {view.kind !== "list" ? (
            <button
              className="text-sm font-bold text-accent hover:underline"
              onClick={() => setView({ kind: "list" })}
              type="button"
            >
              ← กลับ
            </button>
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-md bg-muted text-accent">
              <List className="h-5 w-5" aria-hidden />
            </span>
          )}
          <h3 className="text-lg font-black">
            {view.kind === "list"
              ? `Wanted Lists (${lists.length})`
              : view.listName}
          </h3>
        </div>
        {view.kind === "detail" && (
          <button
            aria-label="ลบ list"
            className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-40"
            disabled={busy}
            onClick={() => handleDelete(view.listId)}
            type="button"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      {error ? (
        <p className="mt-3 text-sm font-semibold text-primary">{error}</p>
      ) : null}

      {/* List view */}
      {view.kind === "list" ? (
        <>
          <form className="mt-4 flex gap-2" onSubmit={handleCreate}>
            <input
              className="h-10 flex-1 rounded-md border border-border px-3 text-sm outline-none focus:border-accent"
              disabled={busy}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="ชื่อ list ใหม่"
              type="text"
              value={newName}
            />
            <button
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-black text-white disabled:opacity-60"
              disabled={busy || !newName.trim()}
              type="submit"
            >
              <Plus className="h-4 w-4" aria-hidden />
              สร้าง
            </button>
          </form>

          {lists.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">ยังไม่มี list</p>
          ) : (
            <div className="mt-4 grid gap-2">
              {lists.map((list) => (
                <div
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
                  key={list.id}
                >
                  {editId === list.id ? (
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
                      <button
                        className="flex-1 text-left"
                        onClick={() =>
                          setView({ kind: "detail", listId: list.id, listName: list.name })
                        }
                        type="button"
                      >
                        <span className="font-bold">{list.name}</span>
                        <span className="ml-2 text-sm font-black text-accent">
                          {list.itemCount}
                        </span>
                      </button>
                      <button
                        className="text-xs text-muted-foreground hover:text-accent disabled:opacity-40"
                        disabled={busy}
                        onClick={() => {
                          setEditId(list.id);
                          setEditName(list.name);
                        }}
                        type="button"
                      >
                        แก้ไข
                      </button>
                      <button
                        aria-label={`ลบ ${list.name}`}
                        className="grid h-7 w-7 flex-none place-items-center rounded border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-40"
                        disabled={busy}
                        onClick={() => handleDelete(list.id)}
                        type="button"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}

      {/* Detail view */}
      {view.kind === "detail" ? (
        <div className="mt-4 grid gap-4">
          <div>
            <p className="mb-2 text-sm font-bold">ของที่ตามหาใน list ({currentMembers.length})</p>
            {currentMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground">ยังว่างอยู่</p>
            ) : (
              <div className="grid gap-2">
                {currentMembers.map((item) => (
                  <div
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                    key={item.id}
                  >
                    <span className="font-bold">{item.name}</span>
                    <button
                      aria-label={`เอา ${item.name} ออกจาก list`}
                      className="grid h-7 w-7 flex-none place-items-center rounded border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-40"
                      disabled={busy}
                      onClick={() => handleAssign(item.id, null)}
                      type="button"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {unassigned.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-bold">เพิ่มเข้า list</p>
              <div className="grid gap-2">
                {unassigned.map((item) => (
                  <button
                    className="flex w-full items-center justify-between rounded-md border border-dashed border-border px-3 py-2 text-left text-sm hover:border-accent disabled:opacity-50"
                    disabled={busy}
                    key={item.id}
                    onClick={() => handleAssign(item.id, view.listId)}
                    type="button"
                  >
                    <span className="font-semibold">{item.name}</span>
                    <span className="flex-none text-xs text-muted-foreground">{item.state}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

// WantedItem ที่ list จะส่ง wantedListId กลับมาด้วย แต่ type ปัจจุบันไม่มี — extend เฉพาะใน component นี้
type WantedItemWithList = WantedItem & { wantedListId?: string | null };

function msg(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}
