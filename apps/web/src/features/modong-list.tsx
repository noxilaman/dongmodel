"use client";

import { useEffect, useState } from "react";
import { Boxes, Image, Loader2, Plus, Trash2, X } from "lucide-react";
import { modongStates } from "@dongmodel/shared";
import type { ModongState } from "@dongmodel/shared";
import {
  apiHost,
  createModongShare,
  deleteModongItem,
  deletePhoto,
  listModong,
  updateModongItem,
  uploadModongAdditionalPhoto,
  uploadModongMainPhoto,
  type CollectibleKind,
  type ModongItem
} from "../lib/api";
import { ShareButton } from "./share-button";
import { CollectibleKindSelector } from "./collectible-kind-selector";

type EditState = {
  name: string;
  state: ModongState;
  collectibleKindId: string;
  releaseYear: string;
  acquisitionYear: string;
  releasedAwayYear: string;
  acquisitionSource: string;
  purchaseAmount: string;
  purchaseCurrency: string;
  releaseAmount: string;
  releaseCurrency: string;
  storageNote: string;
  privateNote: string;
  galleryVisible: boolean;
};

function toEditState(item: ModongItem): EditState {
  return {
    name: item.name,
    state: item.state,
    collectibleKindId: item.collectibleKind?.id ?? "",
    releaseYear: item.releaseYear?.toString() ?? "",
    acquisitionYear: item.acquisitionYear?.toString() ?? "",
    releasedAwayYear: item.releasedAwayYear?.toString() ?? "",
    acquisitionSource: item.acquisitionSource ?? "",
    purchaseAmount: item.purchaseAmount ?? "",
    purchaseCurrency: item.purchaseCurrency,
    releaseAmount: item.releaseAmount ?? "",
    releaseCurrency: item.releaseCurrency,
    storageNote: item.storageNote ?? "",
    privateNote: item.privateNote ?? "",
    galleryVisible: item.galleryVisible
  };
}

export function ModongListPanel({
  onCountChange,
  refreshKey = 0
}: {
  onCountChange?: () => void;
  refreshKey?: number;
}) {
  const [items, setItems] = useState<ModongItem[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, [refreshKey]);

  async function load() {
    try {
      setItems(await listModong());
    } catch (err) {
      setError(msg(err));
    }
  }

  function openEdit(item: ModongItem) {
    setEditId(item.id);
    setEditForm(toEditState(item));
  }

  function cancelEdit() {
    setEditId(null);
    setEditForm(null);
  }

  async function handleSave(id: string) {
    if (!editForm) return;
    setBusy(true);
    setError(null);
    try {
      const payload: Parameters<typeof updateModongItem>[1] = {
        name: editForm.name.trim(),
        state: editForm.state
      };
      if (editForm.collectibleKindId) payload.collectibleKindId = editForm.collectibleKindId;
      const releaseYear = parseYear(editForm.releaseYear);
      const acquisitionYear = parseYear(editForm.acquisitionYear);
      const releasedAwayYear = parseYear(editForm.releasedAwayYear);
      if (releaseYear !== undefined) payload.releaseYear = releaseYear;
      if (acquisitionYear !== undefined) payload.acquisitionYear = acquisitionYear;
      if (releasedAwayYear !== undefined) payload.releasedAwayYear = releasedAwayYear;
      if (editForm.acquisitionSource.trim()) {
        payload.acquisitionSource = editForm.acquisitionSource.trim();
      }
      if (editForm.storageNote.trim()) payload.storageNote = editForm.storageNote.trim();
      if (editForm.privateNote.trim()) payload.privateNote = editForm.privateNote.trim();
      const amount = parseFloat(editForm.purchaseAmount);
      if (!isNaN(amount)) payload.purchaseAmount = amount;
      payload.purchaseCurrency = editForm.purchaseCurrency || "THB";
      const releaseAmount = parseFloat(editForm.releaseAmount);
      if (!isNaN(releaseAmount)) payload.releaseAmount = releaseAmount;
      payload.releaseCurrency = editForm.releaseCurrency || "THB";
      payload.galleryVisible = editForm.galleryVisible;

      await updateModongItem(id, payload);
      cancelEdit();
      await load();
      onCountChange?.();
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
      await deleteModongItem(id);
      await load();
      onCountChange?.();
    } catch (err) {
      setError(msg(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleMainPhoto(id: string, file: File) {
    setBusy(true);
    setError(null);
    try {
      await uploadModongMainPhoto(id, file);
      await load();
    } catch (err) {
      setError(msg(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleAdditionalPhoto(id: string, file: File) {
    setBusy(true);
    setError(null);
    try {
      await uploadModongAdditionalPhoto(id, file);
      await load();
    } catch (err) {
      setError(msg(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDeletePhoto(photoId: string) {
    setBusy(true);
    setError(null);
    try {
      await deletePhoto(photoId);
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
          <Boxes className="h-5 w-5" aria-hidden />
        </span>
        <h3 className="text-lg font-black">โมดองทั้งหมด ({items.length})</h3>
      </div>

      {error ? (
        <p className="mt-3 text-sm font-semibold text-primary">{error}</p>
      ) : null}

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">ยังไม่มีโมดอง</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {items.map((item) =>
            editId === item.id && editForm ? (
              <EditRow
                busy={busy}
                form={editForm}
                key={item.id}
                onChange={setEditForm}
                onCancel={cancelEdit}
                onSave={() => handleSave(item.id)}
              />
            ) : (
              <ItemRow
                busy={busy}
                item={item}
                key={item.id}
                onAdditionalPhoto={(file) => handleAdditionalPhoto(item.id, file)}
                onDelete={() => handleDelete(item.id)}
                onDeletePhoto={handleDeletePhoto}
                onEdit={() => openEdit(item)}
                onMainPhoto={(file) => handleMainPhoto(item.id, file)}
              />
            )
          )}
        </div>
      )}
    </section>
  );
}

function ItemRow({
  busy,
  item,
  onAdditionalPhoto,
  onDelete,
  onDeletePhoto,
  onEdit,
  onMainPhoto
}: {
  busy: boolean;
  item: ModongItem;
  onAdditionalPhoto: (file: File) => void;
  onDelete: () => void;
  onDeletePhoto: (id: string) => void;
  onEdit: () => void;
  onMainPhoto: (file: File) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const allPhotos = [
    ...(item.mainPhoto ? [{ ...item.mainPhoto, isMain: true }] : []),
    ...item.additionalPhotos.map((p) => ({ ...p, isMain: false }))
  ];
  const canAddAdditional = item.additionalPhotos.length < 5;

  return (
    <div className="rounded-md border border-border p-3">
      <div className="flex items-start gap-3">
        {/* Main photo / upload slot */}
        <div className="flex-none">
          {item.mainPhoto ? (
            <div className="relative">
              <img
                alt={item.name}
                className="h-14 w-14 rounded object-cover"
                src={`${apiHost}${item.mainPhoto.url}`}
              />
              <button
                aria-label="เปลี่ยน Main Photo"
                className="absolute bottom-0 right-0 grid h-5 w-5 place-items-center rounded-full bg-foreground text-white"
                disabled={busy}
                type="button"
              >
                <label className="cursor-pointer">
                  <Plus className="h-3 w-3" aria-hidden />
                  <input
                    accept="image/*"
                    className="sr-only"
                    disabled={busy}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onMainPhoto(file);
                      e.target.value = "";
                    }}
                    type="file"
                  />
                </label>
              </button>
            </div>
          ) : (
            <label className="flex h-14 w-14 cursor-pointer items-center justify-center rounded border-2 border-dashed border-border text-muted-foreground hover:border-accent hover:text-accent">
              <Image className="h-5 w-5" aria-hidden />
              <input
                accept="image/*"
                className="sr-only"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onMainPhoto(file);
                  e.target.value = "";
                }}
                type="file"
              />
            </label>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold">{item.name}</p>
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">
              {item.state}
            </span>
            {item.collectibleKind ? (
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {item.collectibleKind.name}
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {item.releaseYear ? <span>ปีที่ออก {item.releaseYear}</span> : null}
            {item.acquisitionYear ? <span>ได้มาปี {item.acquisitionYear}</span> : null}
            {item.releasedAwayYear ? (
              <span>ปล่อยไปปี {item.releasedAwayYear}</span>
            ) : null}
            {item.acquisitionSource ? <span>จาก {item.acquisitionSource}</span> : null}
            {item.purchaseAmount ? (
              <span>
                {item.purchaseAmount} {item.purchaseCurrency}
              </span>
            ) : null}
            {item.releaseAmount ? (
              <span>
                ปล่อย {item.releaseAmount} {item.releaseCurrency}
              </span>
            ) : null}
            {!item.galleryVisible ? <span>ไม่แสดงใน Gallery</span> : null}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-none flex-col items-end gap-1">
          <div className="flex gap-1">
            {confirmDelete ? (
              <div className="animate-fade-in flex gap-1">
                <button
                  className="rounded-md bg-primary px-2 py-1 text-xs font-black text-white disabled:opacity-60"
                  disabled={busy}
                  onClick={() => { setConfirmDelete(false); onDelete(); }}
                  type="button"
                >
                  ลบออก
                </button>
                <button
                  className="rounded-md border border-border px-2 py-1 text-xs font-bold"
                  onClick={() => setConfirmDelete(false)}
                  type="button"
                >
                  ยกเลิก
                </button>
              </div>
            ) : (
              <>
                <button
                  className="rounded-md border border-border px-2 py-1 text-xs font-bold hover:border-accent disabled:opacity-40"
                  disabled={busy}
                  onClick={onEdit}
                  type="button"
                >
                  แก้ไข
                </button>
                <button
                  aria-label={`ลบ ${item.name}`}
                  className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-40"
                  disabled={busy}
                  onClick={() => setConfirmDelete(true)}
                  type="button"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </>
            )}
          </div>
          {!confirmDelete ? (
            <ShareButton
              disabled={busy}
              onShare={() => createModongShare(item.id)}
            />
          ) : null}
        </div>
      </div>

      {/* Photos strip */}
      {(allPhotos.length > 0 || canAddAdditional) ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {allPhotos.map((p) => (
            <div className="relative" key={p.id}>
              <img
                alt=""
                className="h-10 w-10 rounded object-cover"
                src={`${apiHost}${p.url}`}
              />
              {!p.isMain ? (
                <button
                  aria-label="ลบรูปเพิ่มเติม"
                  className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-white"
                  disabled={busy}
                  onClick={() => onDeletePhoto(p.id)}
                  type="button"
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              ) : null}
            </div>
          ))}
          {canAddAdditional ? (
            <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded border-2 border-dashed border-border text-muted-foreground hover:border-accent hover:text-accent">
              <Plus className="h-4 w-4" aria-hidden />
              <input
                accept="image/*"
                className="sr-only"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onAdditionalPhoto(file);
                  e.target.value = "";
                }}
                type="file"
              />
            </label>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function EditRow({
  busy,
  form,
  onChange,
  onCancel,
  onSave
}: {
  busy: boolean;
  form: EditState;
  onChange: (form: EditState) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="animate-fade-in rounded-md border border-accent p-4">
      <div className="grid gap-3">
        <Field label="ชื่อของ">
          <input
            className="h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-accent"
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            type="text"
            value={form.name}
          />
        </Field>

        <Field label="สถานะ">
          <select
            className="h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-accent"
            onChange={(e) => onChange({ ...form, state: e.target.value as ModongState })}
            value={form.state}
          >
            {modongStates.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>

        <CollectibleKindSelector
          disabled={busy}
          onChange={(id) => onChange({ ...form, collectibleKindId: id })}
          value={form.collectibleKindId}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="ปีที่ออก">
            <input
              className="h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-accent"
              onChange={(e) => onChange({ ...form, releaseYear: e.target.value })}
              type="number"
              value={form.releaseYear}
            />
          </Field>
          <Field label="ปีที่ได้">
            <input
              className="h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-accent"
              onChange={(e) => onChange({ ...form, acquisitionYear: e.target.value })}
              type="number"
              value={form.acquisitionYear}
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="ปีที่ปล่อยไปแล้ว">
            <input
              className="h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-accent"
              onChange={(e) => onChange({ ...form, releasedAwayYear: e.target.value })}
              type="number"
              value={form.releasedAwayYear}
            />
          </Field>
          <Field label="แหล่งที่ได้มา">
            <input
              className="h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-accent"
              onChange={(e) => onChange({ ...form, acquisitionSource: e.target.value })}
              type="text"
              value={form.acquisitionSource}
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_88px]">
          <Field label="ราคาซื้อ">
            <input
              className="h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-accent"
              onChange={(e) => onChange({ ...form, purchaseAmount: e.target.value })}
              type="number"
              value={form.purchaseAmount}
            />
          </Field>
          <Field label="สกุลเงิน">
            <input
              className="h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-accent"
              onChange={(e) => onChange({ ...form, purchaseCurrency: e.target.value })}
              type="text"
              value={form.purchaseCurrency}
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_88px]">
          <Field label="ราคาตอนปล่อย">
            <input
              className="h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-accent"
              onChange={(e) => onChange({ ...form, releaseAmount: e.target.value })}
              type="number"
              value={form.releaseAmount}
            />
          </Field>
          <Field label="สกุลเงิน">
            <input
              className="h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-accent"
              onChange={(e) => onChange({ ...form, releaseCurrency: e.target.value })}
              type="text"
              value={form.releaseCurrency}
            />
          </Field>
        </div>

        <label className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm font-semibold">
          <span>แสดงใน Gallery</span>
          <input
            checked={form.galleryVisible}
            className="h-5 w-5 accent-accent"
            onChange={(e) => onChange({ ...form, galleryVisible: e.target.checked })}
            type="checkbox"
          />
        </label>

        <Field label="ที่เก็บ">
          <textarea
            className="min-h-16 w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            onChange={(e) => onChange({ ...form, storageNote: e.target.value })}
            value={form.storageNote}
          />
        </Field>

        <Field label="note ส่วนตัว">
          <textarea
            className="min-h-16 w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            onChange={(e) => onChange({ ...form, privateNote: e.target.value })}
            value={form.privateNote}
          />
        </Field>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-black text-white disabled:opacity-60"
          disabled={busy || !form.name.trim()}
          onClick={onSave}
          type="button"
        >
          {busy
            ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            : null
          }
          บันทึก
        </button>
        <button
          className="rounded-md border border-border px-3 py-2 text-sm font-bold"
          onClick={onCancel}
          type="button"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-sm font-semibold">
      <span>{label}</span>
      {children}
    </label>
  );
}

function parseYear(value: string): number | null | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = parseInt(trimmed, 10);
  return isNaN(n) ? undefined : n;
}

function msg(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}
