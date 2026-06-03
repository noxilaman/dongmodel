"use client";

import { useEffect, useState } from "react";
import { ChevronRight, FolderOpen, Plus, Trash2, X } from "lucide-react";
import {
  addModongToGroup,
  createModongGroup,
  createModongGroupShare,
  deleteModongGroup,
  getModongGroup,
  listModong,
  listModongGroups,
  removeModongFromGroup,
  updateModongGroup,
  type ModongGroup,
  type ModongGroupDetail,
  type ModongItem
} from "../lib/api";
import { ShareButton } from "./share-button";

type View =
  | { kind: "list" }
  | { kind: "detail"; groupId: string }
  | { kind: "edit"; group: ModongGroup };

export function ModongGroupsPanel() {
  const [groups, setGroups] = useState<ModongGroup[]>([]);
  const [view, setView] = useState<View>({ kind: "list" });
  const [detail, setDetail] = useState<ModongGroupDetail | null>(null);
  const [modongList, setModongList] = useState<ModongItem[]>([]);
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [createName, setCreateName] = useState("");
  const [createNote, setCreateNote] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  // Edit form
  const [editName, setEditName] = useState("");
  const [editNote, setEditNote] = useState("");

  useEffect(() => {
    void loadGroups();
  }, []);

  async function loadGroups() {
    try {
      setGroups(await listModongGroups());
    } catch (err) {
      setError(msg(err));
    }
  }

  async function openDetail(id: string) {
    setBusy(true);
    setError(null);
    try {
      const [grp, items] = await Promise.all([getModongGroup(id), listModong()]);
      setDetail(grp);
      setModongList(items);
      setFeaturedIds([]);
      setView({ kind: "detail", groupId: id });
    } catch (err) {
      setError(msg(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await createModongGroup(createName.trim(), createNote.trim() || undefined);
      setCreateName("");
      setCreateNote("");
      setShowCreate(false);
      await loadGroups();
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
      await deleteModongGroup(id);
      if (view.kind !== "list") setView({ kind: "list" });
      await loadGroups();
    } catch (err) {
      setError(msg(err));
    } finally {
      setBusy(false);
    }
  }

  function openEdit(group: ModongGroup) {
    setEditName(group.name);
    setEditNote(group.note ?? "");
    setView({ kind: "edit", group });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (view.kind !== "edit") return;
    setBusy(true);
    setError(null);
    try {
      await updateModongGroup(
        view.group.id,
        editName.trim(),
        editNote.trim() || null
      );
      setView({ kind: "list" });
      await loadGroups();
    } catch (err) {
      setError(msg(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleAddModong(modongId: string) {
    if (view.kind !== "detail") return;
    setBusy(true);
    setError(null);
    try {
      await addModongToGroup(view.groupId, modongId);
      const updated = await getModongGroup(view.groupId);
      setDetail(updated);
      await loadGroups();
    } catch (err) {
      setError(msg(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveModong(modongId: string) {
    if (view.kind !== "detail") return;
    setBusy(true);
    setError(null);
    try {
      await removeModongFromGroup(view.groupId, modongId);
      const updated = await getModongGroup(view.groupId);
      setDetail(updated);
      setFeaturedIds((ids) => ids.filter((id) => id !== modongId));
      await loadGroups();
    } catch (err) {
      setError(msg(err));
    } finally {
      setBusy(false);
    }
  }

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
              <FolderOpen className="h-5 w-5" aria-hidden />
            </span>
          )}
          <h3 className="text-lg font-black">
            {view.kind === "list"
              ? `Modong Groups (${groups.length})`
              : view.kind === "detail"
                ? (detail?.name ?? "...")
                : "แก้ไขกลุ่ม"}
          </h3>
        </div>

        {view.kind === "list" && (
          <button
            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-black text-white disabled:opacity-60"
            disabled={busy}
            onClick={() => setShowCreate((v) => !v)}
            type="button"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            สร้างกลุ่ม
          </button>
        )}
        {view.kind === "detail" && detail && (
          <div className="flex flex-wrap items-center gap-2">
            <ShareButton
              disabled={busy}
              onShare={() => createModongGroupShare(detail.id, featuredIds)}
            />
            <button
              className="rounded-md border border-border px-3 py-1.5 text-xs font-bold hover:border-accent"
              disabled={busy}
              onClick={() => openEdit(detail)}
              type="button"
            >
              แก้ไข
            </button>
            <button
              aria-label="ลบกลุ่ม"
              className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-40"
              disabled={busy}
              onClick={() => handleDelete(detail.id)}
              type="button"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-3 text-sm font-semibold text-primary">{error}</p>
      ) : null}

      {/* Create form */}
      {view.kind === "list" && showCreate ? (
        <form className="mt-4 grid gap-3 rounded-md border border-border p-4" onSubmit={handleCreate}>
          <TextField
            label="ชื่อกลุ่ม"
            name="createName"
            onChange={setCreateName}
            value={createName}
          />
          <TextField
            label="note (ไม่บังคับ)"
            name="createNote"
            onChange={setCreateNote}
            value={createNote}
          />
          <div className="flex gap-2">
            <button
              className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-black text-white disabled:opacity-60"
              disabled={busy || !createName.trim()}
              type="submit"
            >
              สร้าง
            </button>
            <button
              className="rounded-md border border-border px-3 py-2 text-sm font-bold"
              onClick={() => setShowCreate(false)}
              type="button"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      ) : null}

      {/* Edit form */}
      {view.kind === "edit" ? (
        <form className="mt-4 grid gap-3" onSubmit={handleEdit}>
          <TextField
            label="ชื่อกลุ่ม"
            name="editName"
            onChange={setEditName}
            value={editName}
          />
          <TextField
            label="note"
            name="editNote"
            onChange={setEditNote}
            value={editNote}
          />
          <div className="flex gap-2">
            <button
              className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-black text-white disabled:opacity-60"
              disabled={busy || !editName.trim()}
              type="submit"
            >
              บันทึก
            </button>
            <button
              className="rounded-md border border-border px-3 py-2 text-sm font-bold"
              onClick={() => setView({ kind: "list" })}
              type="button"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      ) : null}

      {/* Group list */}
      {view.kind === "list" && groups.length === 0 && !showCreate ? (
        <p className="mt-4 text-sm text-muted-foreground">ยังไม่มีกลุ่ม</p>
      ) : null}

      {view.kind === "list" && groups.length > 0 ? (
        <div className="mt-4 grid gap-2">
          {groups.map((group) => (
            <button
              className="flex w-full items-center justify-between rounded-md border border-border px-3 py-3 text-left hover:border-accent disabled:opacity-50"
              disabled={busy}
              key={group.id}
              onClick={() => openDetail(group.id)}
              type="button"
            >
              <div className="min-w-0">
                <p className="truncate font-bold">{group.name}</p>
                {group.note ? (
                  <p className="truncate text-xs text-muted-foreground">{group.note}</p>
                ) : null}
              </div>
              <div className="flex flex-none items-center gap-2 pl-3">
                <span className="text-sm font-black text-accent">{group.itemCount}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
              </div>
            </button>
          ))}
        </div>
      ) : null}

      {/* Group detail */}
      {view.kind === "detail" && detail ? (
        <DetailView
          busy={busy}
          detail={detail}
          featuredIds={featuredIds}
          modongList={modongList}
          onAddModong={handleAddModong}
          onFeaturedToggle={setFeaturedIds}
          onRemoveModong={handleRemoveModong}
        />
      ) : null}
    </section>
  );
}

function DetailView({
  busy,
  detail,
  featuredIds,
  modongList,
  onAddModong,
  onFeaturedToggle,
  onRemoveModong
}: {
  busy: boolean;
  detail: ModongGroupDetail;
  featuredIds: string[];
  modongList: ModongItem[];
  onAddModong: (modongId: string) => void;
  onFeaturedToggle: (ids: string[]) => void;
  onRemoveModong: (modongId: string) => void;
}) {
  const memberIds = new Set(detail.items.map((i) => i.modongId));
  const available = modongList.filter((m) => !memberIds.has(m.id));

  function toggleFeatured(modongId: string) {
    if (featuredIds.includes(modongId)) {
      onFeaturedToggle(featuredIds.filter((id) => id !== modongId));
      return;
    }

    if (featuredIds.length < 5) {
      onFeaturedToggle([...featuredIds, modongId]);
    }
  }

  return (
    <div className="mt-4 grid gap-4">
      {detail.note ? (
        <p className="text-sm text-muted-foreground">{detail.note}</p>
      ) : null}

      {/* Members */}
      <div>
        <p className="mb-2 text-sm font-bold">สมาชิก ({detail.items.length})</p>
        {detail.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีโมดองในกลุ่ม</p>
        ) : (
          <div className="grid gap-2">
            {detail.items.map((item) => (
              <div
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                key={item.modongId}
              >
                <div>
                  <span className="font-bold">{item.modong.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{item.modong.state}</span>
                </div>
                <div className="ml-2 flex flex-none items-center gap-2">
                  <label className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <input
                      checked={featuredIds.includes(item.modongId)}
                      className="h-4 w-4 accent-accent"
                      disabled={
                        busy ||
                        (!featuredIds.includes(item.modongId) &&
                          featuredIds.length >= 5)
                      }
                      onChange={() => toggleFeatured(item.modongId)}
                      type="checkbox"
                    />
                    รูปแชร์
                  </label>
                  <button
                    aria-label={`ลบ ${item.modong.name} ออกจากกลุ่ม`}
                    className="grid h-7 w-7 place-items-center rounded border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-40"
                    disabled={busy}
                    onClick={() => onRemoveModong(item.modongId)}
                    type="button"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {detail.items.length > 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            เลือกได้สูงสุด 5 รายการสำหรับรูปหัวการ์ดแชร์ ถ้าไม่เลือก ระบบจะใช้รูปแรกที่มีในกลุ่ม
          </p>
        ) : null}
      </div>

      {/* Add from available */}
      {available.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-bold">เพิ่มโมดองเข้ากลุ่ม</p>
          <div className="grid gap-2">
            {available.map((m) => (
              <button
                className="flex w-full items-center justify-between rounded-md border border-dashed border-border px-3 py-2 text-left text-sm hover:border-accent disabled:opacity-50"
                disabled={busy}
                key={m.id}
                onClick={() => onAddModong(m.id)}
                type="button"
              >
                <span className="font-semibold">{m.name}</span>
                <span className="flex-none text-xs text-muted-foreground">{m.state}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TextField({
  label,
  name,
  onChange,
  value
}: {
  label: string;
  name: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold">
      <span>{label}</span>
      <input
        className="h-10 rounded-md border border-border px-3 text-base outline-none focus:border-accent"
        name={name}
        onChange={(e) => onChange(e.target.value)}
        type="text"
        value={value}
      />
    </label>
  );
}

function msg(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}
