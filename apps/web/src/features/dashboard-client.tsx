"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Boxes,
  ChevronDown,
  Image,
  KeyRound,
  Loader2,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  X
} from "lucide-react";
import Link from "next/link";
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

export type DashboardSection =
  | "overview"
  | "modong"
  | "wanted"
  | "groups"
  | "wanted-lists"
  | "admin";

const dashboardSections: Array<{
  href: string;
  label: string;
  section: DashboardSection;
}> = [
  { href: "/", label: "ภาพรวม", section: "overview" },
  { href: "/modong", label: "โมดอง", section: "modong" },
  { href: "/wanted", label: "ของที่ตามหา", section: "wanted" },
  { href: "/groups", label: "กลุ่มโมดอง", section: "groups" },
  { href: "/wanted-lists", label: "รายการตามหา", section: "wanted-lists" },
  { href: "/admin", label: "Admin", section: "admin" }
];

const sectionTitles: Record<DashboardSection, string> = {
  overview: "ภาพรวมกองสะสมส่วนตัว",
  modong: "โมดอง",
  wanted: "ของที่ตามหา",
  groups: "กลุ่มโมดอง",
  "wanted-lists": "รายการตามหา",
  admin: "Admin"
};

const emptyForm: FormState = {
  displayName: "",
  handle: "",
  email: "",
  password: ""
};

export function DashboardClient({
  section = "overview"
}: {
  section?: DashboardSection;
}) {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [modongForm, setModongForm] = useState<ModongFormState>(emptyModongForm);
  const [modongMainPhotoFile, setModongMainPhotoFile] = useState<File | null>(null);
  const [isModongCreateOpen, setIsModongCreateOpen] = useState(false);
  const [modongRefreshKey, setModongRefreshKey] = useState(0);
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
      if (modongMainPhotoFile) {
        await uploadModongMainPhoto(created.id, modongMainPhotoFile);
      }
      setModongForm(emptyModongForm);
      setModongMainPhotoFile(null);
      setIsModongCreateOpen(false);
      setStatus(`เพิ่ม "${created.name}" เข้าโมดองแล้ว`);
      setPendingModongPhoto(null);
      setModongRefreshKey((key) => key + 1);
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
              <img
                alt="Dongmodel"
                className="h-14 w-14 rounded-md object-contain"
                src="/brand/logo.png"
              />
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
              activeSection={section}
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
              <p aria-live="polite" className="text-sm font-bold text-primary">{status}</p>
              <h2 className="text-3xl font-black leading-tight sm:text-4xl">
                {sectionTitles[section]}
              </h2>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-accent" aria-hidden />
              Owner-only
            </div>
          </div>

          {error ? (
            <div
              aria-live="assertive"
              className="animate-fade-in rounded-lg border border-primary bg-white p-4 text-sm font-semibold text-primary"
              role="alert"
            >
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
              isModongCreateOpen={isModongCreateOpen}
              modongMainPhotoFile={modongMainPhotoFile}
              modongRefreshKey={modongRefreshKey}
              onModongCreateOpenChange={setIsModongCreateOpen}
              onModongMainPhotoFileChange={setModongMainPhotoFile}
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
              section={section}
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
        {busy
          ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          : <KeyRound className="h-4 w-4" aria-hidden />
        }
        เข้าสู่ โมดองทันที
      </button>
    </form>
  );
}

function OwnerPanel({
  activeSection,
  busy,
  owner,
  onLogout,
  onRefresh
}: {
  activeSection: DashboardSection;
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
          {busy
            ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            : <LogOut className="h-4 w-4" aria-hidden />
          }
          Logout
        </button>
      </div>
      <div className="mt-2">
        <Link
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-bold transition-colors duration-150 hover:border-accent"
          href={`/owners/${owner.handle}`}
        >
          ดู Gallery ของฉัน
        </Link>
      </div>
      <nav className="mt-4 grid gap-2 border-t border-border pt-4">
        {dashboardSections
          .filter((item) => item.section !== "admin" || owner.role === "ADMIN")
          .map((item) => (
            <Link
              className={`rounded-md border px-3 py-2 text-sm font-bold transition-colors duration-150 ${
                activeSection === item.section
                  ? "border-foreground bg-foreground text-white"
                  : "border-border hover:border-accent"
              }`}
              href={item.href}
              key={item.section}
            >
              {item.label}
            </Link>
          ))}
      </nav>
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
  isModongCreateOpen,
  modongMainPhotoFile,
  modongRefreshKey,
  onModongCreateOpenChange,
  onModongMainPhotoFileChange,
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
  onDeletePhoto,
  section
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
  isModongCreateOpen: boolean;
  modongMainPhotoFile: File | null;
  modongRefreshKey: number;
  onModongCreateOpenChange: (open: boolean) => void;
  onModongMainPhotoFileChange: (file: File | null) => void;
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
  section: DashboardSection;
}) {
  const modongStatePanel = (
    <StatePanel
      icon={<Boxes className="h-5 w-5" aria-hidden />}
      rows={modongStates.map((state) => ({
        label: state,
        value: getModongStateCount(summary, state)
      }))}
      title="สถานะโมดอง"
    />
  );

  const wantedStatePanel = (
    <StatePanel
      icon={<Search className="h-5 w-5" aria-hidden />}
      rows={wantedStates.map((state) => ({
        label: state,
        value: getWantedStateCount(summary, state)
      }))}
      title="สถานะของที่ตามหา"
    />
  );

  const privateSummaryPanel = (
    <details className="group rounded-lg border border-border bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between p-5 [&::-webkit-details-marker]:hidden">
        <h3 className="text-lg font-black">Private value summary</h3>
        <ChevronDown
          aria-hidden
          className="h-4 w-4 flex-none text-muted-foreground transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:rotate-180"
        />
      </summary>
      <div className="grid gap-3 px-5 pb-5">
        <PrivateValue
          label="ราคาซื้อ"
          value={formatValueSummary(summary.privateValueSummary.purchase)}
        />
        <PrivateValue
          label="ราคาตอนปล่อยไปแล้ว"
          value={formatValueSummary(summary.privateValueSummary.release)}
        />
      </div>
    </details>
  );

  if (section === "overview") {
    return (
      <>
        <article className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-muted-foreground">ของที่มีในมือ</p>
          <p className="mt-1 text-5xl font-black sm:text-6xl">{activeTotal}</p>
        </article>
        <section className="grid gap-3 sm:grid-cols-2">
          <MetricCard label="โมดองทั้งหมด" value={summary.modongTotal} />
          <MetricCard label="ของที่ตามหา" value={summary.wantedTotal} />
        </section>
        <section className="grid gap-4 lg:grid-cols-2">
          {modongStatePanel}
          {wantedStatePanel}
        </section>
        {privateSummaryPanel}
      </>
    );
  }

  if (section === "modong") {
    return (
      <>
        {modongStatePanel}
        <ModongListPanel
          onCountChange={onSummaryRefresh}
          refreshKey={modongRefreshKey}
        />
        <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-black">เพิ่มโมดอง</h3>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                เพิ่มรายการใหม่พร้อม Main Photo ได้ในครั้งเดียว
              </p>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-black text-white disabled:opacity-60"
              disabled={busy}
              onClick={() => onModongCreateOpenChange(!isModongCreateOpen)}
              type="button"
            >
              {isModongCreateOpen ? (
                <X className="h-4 w-4" aria-hidden />
              ) : (
                <Plus className="h-4 w-4" aria-hidden />
              )}
              {isModongCreateOpen ? "ปิดฟอร์ม" : "Add โมดอง"}
            </button>
          </div>
          {isModongCreateOpen ? (
            <CreateModongPanel
              busy={busy}
              form={modongForm}
              mainPhotoFile={modongMainPhotoFile}
              onChange={onModongFormChange}
              onMainPhotoFileChange={onModongMainPhotoFileChange}
              onSubmit={onModongSubmit}
            />
          ) : null}
        </section>
      </>
    );
  }

  if (section === "wanted") {
    return (
      <>
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
          {wantedStatePanel}
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
        ) : (
          <section className="rounded-lg border border-border bg-white p-5 text-sm font-semibold text-muted-foreground shadow-sm">
            ยังไม่มีของที่ตามหา
          </section>
        )}
      </>
    );
  }

  if (section === "groups") {
    return <ModongGroupsPanel />;
  }

  if (section === "wanted-lists") {
    return <WantedListsPanel />;
  }

  if (owner?.role === "ADMIN") {
    return <AdminKindsPanel />;
  }

  return (
    <section className="rounded-lg border border-border bg-white p-5 text-sm font-semibold text-muted-foreground shadow-sm">
      หน้านี้ใช้ได้เฉพาะ Admin
    </section>
  );
}

function CreateModongPanel({
  busy,
  form,
  mainPhotoFile,
  onChange,
  onMainPhotoFileChange,
  onSubmit
}: {
  busy: boolean;
  form: ModongFormState;
  mainPhotoFile: File | null;
  onChange: (form: ModongFormState) => void;
  onMainPhotoFileChange: (file: File | null) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <form
      className="mt-4 rounded-lg border border-border bg-white p-5 shadow-sm"
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

        <label className="grid gap-2 rounded-md border border-dashed border-border p-3 text-sm font-semibold">
          <span>Main Photo</span>
          <span className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="truncate text-muted-foreground">
              {mainPhotoFile ? mainPhotoFile.name : "เลือกรูปของจริงที่ถ่ายเอง"}
            </span>
            <span className="inline-flex w-fit items-center justify-center gap-2 rounded-md bg-foreground px-3 py-2 text-xs font-black text-white">
              <Image className="h-4 w-4" aria-hidden />
              เลือกรูป
            </span>
          </span>
          <input
            accept="image/*"
            className="sr-only"
            disabled={busy}
            onChange={(event) =>
              onMainPhotoFileChange(event.target.files?.[0] ?? null)
            }
            type="file"
          />
        </label>

        <button
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
          onClick={() => setShowDetails((v) => !v)}
          type="button"
        >
          <ChevronDown
            aria-hidden
            className={`h-4 w-4 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${showDetails ? "rotate-180" : ""}`}
          />
          {showDetails ? "ซ่อนรายละเอียด" : "เพิ่มรายละเอียด"}
        </button>

        {showDetails ? (
          <div className="animate-fade-in grid gap-3">
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

            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="ปีที่ปล่อยไปแล้ว"
                name="releasedAwayYear"
                onChange={(value) => onChange({ ...form, releasedAwayYear: value })}
                type="number"
                value={form.releasedAwayYear}
              />
              <TextField
                label="แหล่งที่ได้มา"
                name="acquisitionSource"
                onChange={(value) => onChange({ ...form, acquisitionSource: value })}
                value={form.acquisitionSource}
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

            <div className="grid gap-3 sm:grid-cols-[1fr_88px]">
              <TextField
                label="ราคาตอนปล่อย"
                name="releaseAmount"
                onChange={(value) => onChange({ ...form, releaseAmount: value })}
                type="number"
                value={form.releaseAmount}
              />
              <TextField
                label="สกุลเงิน"
                name="releaseCurrency"
                onChange={(value) => onChange({ ...form, releaseCurrency: value })}
                value={form.releaseCurrency}
              />
            </div>

            <label className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm font-semibold">
              <span>แสดงใน Gallery</span>
              <input
                checked={form.galleryVisible}
                className="h-5 w-5 accent-accent"
                onChange={(event) =>
                  onChange({ ...form, galleryVisible: event.target.checked })
                }
                type="checkbox"
              />
            </label>

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
        ) : null}
      </div>

      <button
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-black text-white disabled:opacity-60"
        disabled={busy || !form.name.trim()}
        type="submit"
      >
        {busy
          ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          : <Plus className="h-4 w-4" aria-hidden />
        }
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
        {busy
          ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          : <Plus className="h-4 w-4" aria-hidden />
        }
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
}) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [pendingMission, setPendingMission] = useState<{
    id: string;
    prevState: WantedItem["state"];
  } | null>(null);

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
                    aria-label={`ลบรูปอ้างอิง ${item.name}`}
                    className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-white"
                    disabled={busy}
                    onClick={() => onPhotoDelete(item.referencePhoto!.id)}
                    type="button"
                  >
                    <X className="h-3 w-3" aria-hidden />
                  </button>
                </div>
              ) : (
                <label
                  aria-label={`อัพโหลดรูปอ้างอิง ${item.name}`}
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
                  onChange={(event) => {
                    const newState = event.target.value as WantedItem["state"];
                    if (newState === "mission complete") {
                      setPendingMission({ id: item.id, prevState: item.state });
                    } else {
                      onStateChange(item.id, newState);
                    }
                  }}
                  value={pendingMission?.id === item.id ? "mission complete" : item.state}
                >
                  {wantedStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {pendingMission?.id === item.id ? (
                  <div className="animate-fade-in mt-1.5 rounded-md border border-accent p-2">
                    <p className="text-xs font-semibold leading-4">
                      สถานะนี้จะสร้างโมดองใหม่ทันที ยืนยัน?
                    </p>
                    <div className="mt-1.5 flex gap-1.5">
                      <button
                        className="rounded bg-accent px-2 py-1 text-xs font-black text-white disabled:opacity-60"
                        disabled={busy}
                        onClick={() => {
                          onStateChange(item.id, "mission complete");
                          setPendingMission(null);
                        }}
                        type="button"
                      >
                        ยืนยัน
                      </button>
                      <button
                        className="rounded border border-border px-2 py-1 text-xs font-bold"
                        onClick={() => setPendingMission(null)}
                        type="button"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                ) : null}
                {item.state === "กำลังงมเข็ม" && pendingMission?.id !== item.id ? (
                  <div className="mt-1.5">
                    <ShareButton
                      disabled={busy}
                      onShare={() => createWantedShare(item.id)}
                    />
                  </div>
                ) : null}
              </div>
              {deleteConfirmId === item.id ? (
                <div className="animate-fade-in flex flex-none flex-col gap-1">
                  <button
                    className="rounded-md bg-primary px-2 py-1 text-xs font-black text-white disabled:opacity-60"
                    disabled={busy}
                    onClick={() => {
                      onDelete(item.id);
                      setDeleteConfirmId(null);
                    }}
                    type="button"
                  >
                    ลบออก
                  </button>
                  <button
                    className="rounded-md border border-border px-2 py-1 text-xs font-bold"
                    onClick={() => setDeleteConfirmId(null)}
                    type="button"
                  >
                    ยกเลิก
                  </button>
                </div>
              ) : (
                <button
                  aria-label={`ลบ ${item.name}`}
                  className="grid h-8 w-8 flex-none place-items-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-40"
                  disabled={busy}
                  onClick={() => setDeleteConfirmId(item.id)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              )}
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
      <p className="mt-2 text-3xl font-black">{value}</p>
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
