"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Boxes,
  Image,
  KeyRound,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  X
} from "lucide-react";
import {
  modongStates,
  type OwnerSummary,
  publicPhrases,
  wantedStates
} from "@dongmodel/shared";
import {
  apiHost,
  authenticateOwner,
  createModongItem,
  createWantedItem,
  createWantedShare,
  deletePhoto,
  deleteWantedItem,
  getCurrentOwner,
  getOwnerSummary,
  listWantedItems,
  logoutOwner,
  updateWantedItem,
  uploadModongMainPhoto,
  uploadWantedReferencePhoto,
  type AuthMode,
  type Owner,
  type PhotoDto,
  type WantedItem
} from "../lib/api";
import { ShareButton } from "./share-button";
import {
  buildCreateModongPayload,
  emptyModongForm,
  type ModongFormState
} from "../lib/modong-form";
import {
  buildCreateWantedPayload,
  emptyWantedForm,
  type WantedFormState
} from "../lib/wanted-form";
import { AdminKindsPanel } from "./admin-kinds";
import { CollectibleKindSelector } from "./collectible-kind-selector";
import { ModongGroupsPanel } from "./modong-groups";
import { ModongListPanel } from "./modong-list";
import { WantedListsPanel } from "./wanted-lists";
import {
  formatValueSummary,
  getActiveSummaryTotal,
  getModongStateCount,
  getWantedStateCount
} from "../lib/summary";

type FormState = {
  displayName: string;
  handle: string;
  email: string;
  password: string;
};

const emptyForm: FormState = {
  displayName: "",
  handle: "",
  email: "",
  password: ""
};

export function DashboardClient() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [modongForm, setModongForm] = useState<ModongFormState>(emptyModongForm);
  const [wantedForm, setWantedForm] = useState<WantedFormState>(emptyWantedForm);
  const [wantedItems, setWantedItems] = useState<WantedItem[]>([]);
  // After creation, hold the new item's id + name so user can upload a photo before dismissing.
  const [pendingModongPhoto, setPendingModongPhoto] = useState<{ id: string; name: string } | null>(null);
  const [pendingWantedPhoto, setPendingWantedPhoto] = useState<{ id: string; name: string } | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [summary, setSummary] = useState<OwnerSummary | null>(null);
  const [status, setStatus] = useState("กำลังตรวจ session");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function boot() {
      const currentOwner = await getCurrentOwner();
      if (!isMounted) return;

      setOwner(currentOwner);
      setStatus(currentOwner ? "โหลด dashboard แล้ว" : "เข้าสู่ โมดองทันที");

      if (currentOwner) {
        await Promise.all([loadSummary(), loadWantedItems()]);
      }
    }

    void boot();

    return () => {
      isMounted = false;
    };
  }, []);

  async function loadSummary() {
    try {
      setSummary(await getOwnerSummary());
      setError(null);
    } catch (summaryError) {
      setError(getErrorMessage(summaryError));
    }
  }

  async function loadWantedItems() {
    try {
      setWantedItems(await listWantedItems());
    } catch {
      // non-critical — summary already shows wanted counts
    }
  }

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const nextOwner = await authenticateOwner(
        authMode,
        authMode === "login"
          ? { email: form.email, password: form.password }
          : form
      );
      setOwner(nextOwner);
      setForm(emptyForm);
      setStatus("โหลด dashboard แล้ว");
      await Promise.all([
        getOwnerSummary().then(setSummary),
        loadWantedItems()
      ]);
    } catch (authError) {
      setError(getErrorMessage(authError));
    } finally {
      setBusy(false);
    }
  }

  async function submitModong(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const created = await createModongItem(buildCreateModongPayload(modongForm));
      setModongForm(emptyModongForm);
      setStatus(`เพิ่ม "${created.name}" เข้าโมดองแล้ว`);
      setPendingModongPhoto({ id: created.id, name: created.name });
      setSummary(await getOwnerSummary());
    } catch (modongError) {
      setError(getErrorMessage(modongError));
    } finally {
      setBusy(false);
    }
  }

  async function submitWanted(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const created = await createWantedItem(buildCreateWantedPayload(wantedForm));
      setWantedForm(emptyWantedForm);
      setStatus(`เพิ่ม "${created.name}" เข้าของที่ตามหาแล้ว`);
      setPendingWantedPhoto({ id: created.id, name: created.name });
      await Promise.all([loadSummary(), loadWantedItems()]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleModongPhotoUpload(modongId: string, file: File) {
    setBusy(true);
    setError(null);
    try {
      await uploadModongMainPhoto(modongId, file);
      setStatus("อัพโหลดรูปโมดองแล้ว");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleWantedPhotoUpload(wantedId: string, file: File) {
    setBusy(true);
    setError(null);
    try {
      await uploadWantedReferencePhoto(wantedId, file);
      setStatus("อัพโหลดรูปของที่ตามหาแล้ว");
      await loadWantedItems();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDeletePhoto(photoId: string) {
    setBusy(true);
    setError(null);
    try {
      await deletePhoto(photoId);
      await loadWantedItems();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleWantedStateChange(id: string, state: WantedItem["state"]) {
    setBusy(true);
    setError(null);

    try {
      await updateWantedItem(id, { state });
      await Promise.all([loadSummary(), loadWantedItems()]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteWanted(id: string) {
    setBusy(true);
    setError(null);

    try {
      await deleteWantedItem(id);
      await Promise.all([loadSummary(), loadWantedItems()]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    setError(null);

    try {
      await logoutOwner();
      setOwner(null);
      setSummary(null);
      setWantedItems([]);
      setStatus("เข้าสู่ โมดองทันที");
    } catch (logoutError) {
      setError(getErrorMessage(logoutError));
    } finally {
      setBusy(false);
    }
  }

  const activeTotal = useMemo(
    () => (summary ? getActiveSummaryTotal(summary) : 0),
    [summary]
  );

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[340px_1fr]">
        <aside className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-foreground text-white">
                <Boxes className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">
                  Dongmodel
                </p>
                <h1 className="text-2xl font-black">โมดอง</h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {owner
                ? `${owner.displayName} @${owner.handle}`
                : "จัดของที่มี ของที่ตามหา และแชร์ความสุลต่านแบบไม่โชว์ราคา"}
            </p>
          </div>

          {owner ? (
            <OwnerPanel
              busy={busy}
              owner={owner}
              onLogout={handleLogout}
              onRefresh={loadSummary}
            />
          ) : (
            <AuthPanel
              authMode={authMode}
              busy={busy}
              form={form}
              onFormChange={setForm}
              onModeChange={setAuthMode}
              onSubmit={submitAuth}
            />
          )}
        </aside>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold text-primary">{status}</p>
              <h2 className="text-3xl font-black leading-tight sm:text-4xl">
                ภาพรวมกองสะสมส่วนตัว
              </h2>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-accent" aria-hidden />
              Owner-only
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-primary bg-white p-4 text-sm font-semibold text-primary">
              {error}
            </div>
          ) : null}

          {summary ? (
            <SummaryDashboard
              activeTotal={activeTotal}
              busy={busy}
              owner={owner}
              onSummaryRefresh={loadSummary}
              modongForm={modongForm}
              onModongFormChange={setModongForm}
              onModongSubmit={submitModong}
              pendingModongPhoto={pendingModongPhoto}
              onModongPhotoDismiss={() => setPendingModongPhoto(null)}
              onModongPhotoUpload={handleModongPhotoUpload}
              summary={summary}
              wantedForm={wantedForm}
              wantedItems={wantedItems}
              onWantedFormChange={setWantedForm}
              onWantedSubmit={submitWanted}
              onWantedStateChange={handleWantedStateChange}
              onWantedDelete={handleDeleteWanted}
              pendingWantedPhoto={pendingWantedPhoto}
              onWantedPhotoDismiss={() => setPendingWantedPhoto(null)}
              onWantedPhotoUpload={handleWantedPhotoUpload}
              onDeletePhoto={handleDeletePhoto}
            />
          ) : (
            <EmptyDashboard />
          )}
        </section>
      </section>
    </main>
  );
}

function AuthPanel({
  authMode,
  busy,
  form,
  onFormChange,
  onModeChange,
  onSubmit
}: {
  authMode: AuthMode;
  busy: boolean;
  form: FormState;
  onFormChange: (form: FormState) => void;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      className="rounded-lg border border-border bg-white p-5 shadow-sm"
      onSubmit={onSubmit}
    >
      <div className="grid grid-cols-2 rounded-lg border border-border p-1">
        {(["login", "register"] as const).map((mode) => (
          <button
            className={`rounded-md px-3 py-2 text-sm font-bold ${
              authMode === mode ? "bg-foreground text-white" : "text-foreground"
            }`}
            key={mode}
            onClick={() => onModeChange(mode)}
            type="button"
          >
            {mode === "login" ? "Login" : "Register"}
          </button>
        ))}
      </div>

      {authMode === "register" ? (
        <div className="mt-4 grid gap-3">
          <TextField
            label="ชื่อที่แสดง"
            name="displayName"
            onChange={(value) => onFormChange({ ...form, displayName: value })}
            value={form.displayName}
          />
          <TextField
            label="handle"
            name="handle"
            onChange={(value) => onFormChange({ ...form, handle: value })}
            value={form.handle}
          />
        </div>
      ) : null}

      <div className="mt-4 grid gap-3">
        <TextField
          label="email"
          name="email"
          onChange={(value) => onFormChange({ ...form, email: value })}
          type="email"
          value={form.email}
        />
        <TextField
          label="password"
          name="password"
          onChange={(value) => onFormChange({ ...form, password: value })}
          type="password"
          value={form.password}
        />
      </div>

      <button
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-black text-white disabled:opacity-60"
        disabled={busy}
        type="submit"
      >
        <KeyRound className="h-4 w-4" aria-hidden />
        เข้าสู่ โมดองทันที
      </button>
    </form>
  );
}

function OwnerPanel({
  busy,
  owner,
  onLogout,
  onRefresh
}: {
  busy: boolean;
  owner: Owner;
  onLogout: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-muted-foreground">Logged in</p>
      <p className="mt-1 font-bold">{owner.email}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-bold"
          disabled={busy}
          onClick={onRefresh}
          type="button"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Refresh
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-bold text-white"
          disabled={busy}
          onClick={onLogout}
          type="button"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Logout
        </button>
      </div>
    </div>
  );
}

function SummaryDashboard({
  activeTotal,
  busy,
  owner,
  onSummaryRefresh,
  modongForm,
  onModongFormChange,
  onModongSubmit,
  pendingModongPhoto,
  onModongPhotoDismiss,
  onModongPhotoUpload,
  summary,
  wantedForm,
  wantedItems,
  onWantedFormChange,
  onWantedSubmit,
  onWantedStateChange,
  onWantedDelete,
  pendingWantedPhoto,
  onWantedPhotoDismiss,
  onWantedPhotoUpload,
  onDeletePhoto
}: {
  activeTotal: number;
  busy: boolean;
  owner: Owner | null;
  onSummaryRefresh: () => void;
  modongForm: ModongFormState;
  onModongFormChange: (form: ModongFormState) => void;
  onModongSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  pendingModongPhoto: { id: string; name: string } | null;
  onModongPhotoDismiss: () => void;
  onModongPhotoUpload: (id: string, file: File) => void;
  summary: OwnerSummary;
  wantedForm: WantedFormState;
  wantedItems: WantedItem[];
  onWantedFormChange: (form: WantedFormState) => void;
  onWantedSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onWantedStateChange: (id: string, state: WantedItem["state"]) => void;
  onWantedDelete: (id: string) => void;
  pendingWantedPhoto: { id: string; name: string } | null;
  onWantedPhotoDismiss: () => void;
  onWantedPhotoUpload: (id: string, file: File) => void;
  onDeletePhoto: (photoId: string) => void;
}) {
  return (
    <>
      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="ของที่มีในมือ" value={activeTotal} />
        <MetricCard label="โมดองทั้งหมด" value={summary.modongTotal} />
        <MetricCard label="ของที่ตามหา" value={summary.wantedTotal} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <CreateModongPanel
            busy={busy}
            form={modongForm}
            onChange={onModongFormChange}
            onSubmit={onModongSubmit}
          />
          {pendingModongPhoto ? (
            <PendingPhotoUpload
              busy={busy}
              label="อัพโหลดรูปโมดอง (Main Photo)"
              name={pendingModongPhoto.name}
              onDismiss={onModongPhotoDismiss}
              onUpload={(file) => onModongPhotoUpload(pendingModongPhoto.id, file)}
            />
          ) : null}
        </div>
        <StatePanel
          icon={<Boxes className="h-5 w-5" aria-hidden />}
          rows={modongStates.map((state) => ({
            label: state,
            value: getModongStateCount(summary, state)
          }))}
          title="สถานะโมดอง"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <CreateWantedPanel
            busy={busy}
            form={wantedForm}
            onChange={onWantedFormChange}
            onSubmit={onWantedSubmit}
          />
          {pendingWantedPhoto ? (
            <PendingPhotoUpload
              busy={busy}
              label="อัพโหลดรูปอ้างอิง (Wanted Reference Photo)"
              name={pendingWantedPhoto.name}
              onDismiss={onWantedPhotoDismiss}
              onUpload={(file) => onWantedPhotoUpload(pendingWantedPhoto.id, file)}
            />
          ) : null}
        </div>
        <StatePanel
          icon={<Search className="h-5 w-5" aria-hidden />}
          rows={wantedStates.map((state) => ({
            label: state,
            value: getWantedStateCount(summary, state)
          }))}
          title="สถานะของที่ตามหา"
        />
      </section>

      {wantedItems.length > 0 ? (
        <WantedItemsPanel
          busy={busy}
          items={wantedItems}
          onDelete={onWantedDelete}
          onStateChange={onWantedStateChange}
          onPhotoUpload={onWantedPhotoUpload}
          onPhotoDelete={onDeletePhoto}
        />
      ) : null}

      <ModongListPanel onCountChange={onSummaryRefresh} />

      <ModongGroupsPanel />

      <WantedListsPanel />

      {owner?.role === "ADMIN" ? <AdminKindsPanel /> : null}

      <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h3 className="text-lg font-black">Private value summary</h3>
        <div className="mt-4 grid gap-3">
          <PrivateValue
            label="ราคาซื้อ"
            value={formatValueSummary(summary.privateValueSummary.purchase)}
          />
          <PrivateValue
            label="ราคาตอนปล่อยไปแล้ว"
            value={formatValueSummary(summary.privateValueSummary.release)}
          />
        </div>
      </section>
    </>
  );
}

function CreateModongPanel({
  busy,
  form,
  onChange,
  onSubmit
}: {
  busy: boolean;
  form: ModongFormState;
  onChange: (form: ModongFormState) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      className="rounded-lg border border-border bg-white p-5 shadow-sm"
      onSubmit={onSubmit}
    >
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-white">
          <Plus className="h-5 w-5" aria-hidden />
        </span>
        <h3 className="text-lg font-black">เพิ่มโมดอง</h3>
      </div>

      <div className="mt-4 grid gap-3">
        <TextField
          label="ชื่อของ"
          name="modongName"
          onChange={(value) => onChange({ ...form, name: value })}
          value={form.name}
        />

        <label className="grid gap-1 text-sm font-semibold">
          <span>สถานะ</span>
          <select
            className="h-11 rounded-md border border-border bg-white px-3 text-base outline-none focus:border-accent"
            onChange={(event) =>
              onChange({
                ...form,
                state: event.target.value as ModongFormState["state"]
              })
            }
            value={form.state}
          >
            {modongStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>

        <CollectibleKindSelector
          disabled={busy}
          onChange={(id) => onChange({ ...form, collectibleKindId: id })}
          value={form.collectibleKindId}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="ปีที่ออก"
            name="releaseYear"
            onChange={(value) => onChange({ ...form, releaseYear: value })}
            type="number"
            value={form.releaseYear}
          />
          <TextField
            label="ปีที่ได้"
            name="acquisitionYear"
            onChange={(value) => onChange({ ...form, acquisitionYear: value })}
            type="number"
            value={form.acquisitionYear}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_88px]">
          <TextField
            label="ราคาซื้อ"
            name="purchaseAmount"
            onChange={(value) => onChange({ ...form, purchaseAmount: value })}
            type="number"
            value={form.purchaseAmount}
          />
          <TextField
            label="สกุลเงิน"
            name="purchaseCurrency"
            onChange={(value) => onChange({ ...form, purchaseCurrency: value })}
            value={form.purchaseCurrency}
          />
        </div>

        <TextAreaField
          label="ที่เก็บ"
          name="storageNote"
          onChange={(value) => onChange({ ...form, storageNote: value })}
          value={form.storageNote}
        />
        <TextAreaField
          label="note ส่วนตัว"
          name="privateNote"
          onChange={(value) => onChange({ ...form, privateNote: value })}
          value={form.privateNote}
        />
      </div>

      <button
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-black text-white disabled:opacity-60"
        disabled={busy || !form.name.trim()}
        type="submit"
      >
        <Plus className="h-4 w-4" aria-hidden />
        เพิ่มเข้าโมดอง
      </button>
    </form>
  );
}

function CreateWantedPanel({
  busy,
  form,
  onChange,
  onSubmit
}: {
  busy: boolean;
  form: WantedFormState;
  onChange: (form: WantedFormState) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      className="rounded-lg border border-border bg-white p-5 shadow-sm"
      onSubmit={onSubmit}
    >
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-accent text-white">
          <Search className="h-5 w-5" aria-hidden />
        </span>
        <h3 className="text-lg font-black">เพิ่มของที่ตามหา</h3>
      </div>

      <div className="mt-4 grid gap-3">
        <TextField
          label="ชื่อของที่ตามหา"
          name="wantedName"
          onChange={(value) => onChange({ ...form, name: value })}
          value={form.name}
        />

        <label className="grid gap-1 text-sm font-semibold">
          <span>สถานะ</span>
          <select
            className="h-11 rounded-md border border-border bg-white px-3 text-base outline-none focus:border-accent"
            onChange={(event) =>
              onChange({
                ...form,
                state: event.target.value as WantedFormState["state"]
              })
            }
            value={form.state}
          >
            {wantedStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>

        <CollectibleKindSelector
          disabled={busy}
          onChange={(id) => onChange({ ...form, collectibleKindId: id })}
          value={form.collectibleKindId}
        />

        <TextAreaField
          label="note ส่วนตัว"
          name="wantedNote"
          onChange={(value) => onChange({ ...form, wantedNote: value })}
          value={form.wantedNote}
        />
      </div>

      <button
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-black text-white disabled:opacity-60"
        disabled={busy || !form.name.trim()}
        type="submit"
      >
        <Plus className="h-4 w-4" aria-hidden />
        เพิ่มเข้าของที่ตามหา
      </button>
    </form>
  );
}

function WantedItemsPanel({
  busy,
  items,
  onDelete,
  onStateChange,
  onPhotoUpload,
  onPhotoDelete
}: {
  busy: boolean;
  items: WantedItem[];
  onDelete: (id: string) => void;
  onStateChange: (id: string, state: WantedItem["state"]) => void;
  onPhotoUpload: (id: string, file: File) => void;
  onPhotoDelete: (photoId: string) => void;
})
 {
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-muted text-accent">
          <Search className="h-5 w-5" aria-hidden />
        </span>
        <h3 className="text-lg font-black">ของที่ตามหา ({items.length})</h3>
      </div>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div
            className="rounded-md border border-border p-3"
            key={item.id}
          >
            <div className="flex items-center gap-3">
              {item.referencePhoto ? (
                <div className="relative flex-none">
                  <img
                    alt={item.name}
                    className="h-12 w-12 rounded object-cover"
                    src={`${apiHost}${item.referencePhoto.url}`}
                  />
                  <button
                    aria-label="ลบรูป"
                    className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-primary text-white"
                    disabled={busy}
                    onClick={() => onPhotoDelete(item.referencePhoto!.id)}
                    type="button"
                  >
                    <X className="h-2.5 w-2.5" aria-hidden />
                  </button>
                </div>
              ) : (
                <label
                  aria-label={`อัพโหลดรูป ${item.name}`}
                  className="flex h-12 w-12 flex-none cursor-pointer items-center justify-center rounded border-2 border-dashed border-border text-muted-foreground hover:border-accent hover:text-accent"
                >
                  <Image className="h-5 w-5" aria-hidden />
                  <input
                    accept="image/*"
                    className="sr-only"
                    disabled={busy}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onPhotoUpload(item.id, file);
                      e.target.value = "";
                    }}
                    type="file"
                  />
                </label>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{item.name}</p>
                <select
                  className="mt-1 h-8 rounded border border-border bg-white px-2 text-xs outline-none focus:border-accent"
                  disabled={busy}
                  onChange={(event) =>
                    onStateChange(item.id, event.target.value as WantedItem["state"])
                  }
                  value={item.state}
                >
                  {wantedStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {item.state === "กำลังงมเข็ม" ? (
                  <div className="mt-1.5">
                    <ShareButton
                      disabled={busy}
                      onShare={() => createWantedShare(item.id)}
                    />
                  </div>
                ) : null}
              </div>
              <button
                aria-label={`ลบ ${item.name}`}
                className="grid h-8 w-8 flex-none place-items-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-40"
                disabled={busy}
                onClick={() => onDelete(item.id)}
                type="button"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PendingPhotoUpload({
  busy,
  label,
  name,
  onDismiss,
  onUpload
}: {
  busy: boolean;
  label: string;
  name: string;
  onDismiss: () => void;
  onUpload: (file: File) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-accent bg-white p-4 shadow-sm">
      <span className="grid h-9 w-9 flex-none place-items-center rounded-md bg-accent text-white">
        <Image className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{name}</p>
      </div>
      <label className="flex-none cursor-pointer rounded-md bg-accent px-3 py-2 text-xs font-black text-white disabled:opacity-60">
        เลือกรูป
        <input
          accept="image/*"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onUpload(file);
              onDismiss();
            }
            e.target.value = "";
          }}
          type="file"
        />
      </label>
      <button
        aria-label="ข้ามการอัพโหลดรูป"
        className="flex-none text-muted-foreground hover:text-foreground"
        onClick={onDismiss}
        type="button"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-muted-foreground">{label}</p>
      <p className="mt-2 text-4xl font-black">{value}</p>
    </article>
  );
}

function StatePanel({
  icon,
  rows,
  title
}: {
  icon: ReactNode;
  rows: Array<{ label: string; value: number }>;
  title: string;
}) {
  return (
    <article className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-muted text-accent">
          {icon}
        </span>
        <h3 className="text-lg font-black">{title}</h3>
      </div>
      <div className="mt-4 grid gap-2">
        {rows.map((row) => (
          <div
            className="flex min-h-10 items-center justify-between rounded-md border border-border px-3 text-sm"
            key={row.label}
          >
            <span className="font-semibold">{row.label}</span>
            <span className="font-black">{row.value}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function PrivateValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-4">
      <p className="text-sm font-bold text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-xl font-black">{value}</p>
    </div>
  );
}

function TextField({
  label,
  name,
  onChange,
  type = "text",
  value
}: {
  label: string;
  name: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold">
      <span>{label}</span>
      <input
        className="h-11 rounded-md border border-border px-3 text-base outline-none focus:border-accent"
        name={name}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  );
}

function TextAreaField({
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
      <textarea
        className="min-h-20 rounded-md border border-border px-3 py-2 text-base outline-none focus:border-accent"
        name={name}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function EmptyDashboard() {
  return (
    <section className="rounded-lg border border-border bg-white p-8 text-center shadow-sm">
      <p className="text-lg font-black">เข้าสู่ โมดองทันที</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Login หรือ Register เพื่อดูจำนวนของที่มี ของที่ตามหา และ private summary
        ของตัวเอง
      </p>
      <p className="mt-5 text-sm font-bold text-accent">
        {publicPhrases.wantedShare}
      </p>
    </section>
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}
