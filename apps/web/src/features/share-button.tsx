"use client";

import { useState } from "react";
import { Check, Link, Share2, X } from "lucide-react";

type Props = {
  onShare: () => Promise<string>;
  disabled?: boolean;
};

type State =
  | { kind: "idle" }
  | { kind: "busy" }
  | { kind: "ready"; token: string; url: string; copied: boolean }
  | { kind: "error"; message: string };

function buildShareUrl(token: string): string {
  const base =
    typeof window !== "undefined"
      ? `${window.location.origin}/s/${token}`
      : `/s/${token}`;
  return base;
}

export function ShareButton({ onShare, disabled }: Props) {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function handleShare() {
    setState({ kind: "busy" });
    try {
      const token = await onShare();
      const url = buildShareUrl(token);
      setState({ kind: "ready", token, url, copied: false });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
      });
    }
  }

  async function handleCopy(url: string) {
    await navigator.clipboard.writeText(url);
    setState((s) => (s.kind === "ready" ? { ...s, copied: true } : s));
    setTimeout(
      () => setState((s) => (s.kind === "ready" ? { ...s, copied: false } : s)),
      2000
    );
  }

  if (state.kind === "idle" || state.kind === "busy" || state.kind === "error") {
    return (
      <div className="flex flex-col gap-1">
        <button
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-bold text-muted-foreground hover:border-accent hover:text-accent disabled:opacity-40"
          disabled={disabled || state.kind === "busy"}
          onClick={handleShare}
          type="button"
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden />
          {state.kind === "busy" ? "กำลังสร้าง..." : "แชร์"}
        </button>
        {state.kind === "error" ? (
          <p className="text-xs text-primary">{state.message}</p>
        ) : null}
      </div>
    );
  }

  // ready state — show URL + copy + dismiss
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-accent bg-white px-2.5 py-1.5">
      <Link className="h-3.5 w-3.5 flex-none text-accent" aria-hidden />
      <span className="max-w-[180px] truncate text-xs font-semibold">{state.url}</span>
      <button
        className="flex-none rounded px-1.5 py-0.5 text-xs font-black text-accent hover:bg-muted"
        onClick={() => handleCopy(state.url)}
        type="button"
      >
        {state.copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : "copy"}
      </button>
      <button
        aria-label="ปิด"
        className="flex-none text-muted-foreground hover:text-foreground"
        onClick={() => setState({ kind: "idle" })}
        type="button"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}
