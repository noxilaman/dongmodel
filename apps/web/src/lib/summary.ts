import type { OwnerSummary, ValueSummaryEntry } from "@dongmodel/shared";
import type { ModongState, WantedState } from "@dongmodel/shared";

export function formatValueSummary(entries: ValueSummaryEntry[]): string {
  if (entries.length === 0) {
    return "-";
  }

  return entries
    .map((entry) => `${entry.amount} ${entry.currency}`)
    .join(" / ");
}

export function getActiveSummaryTotal(summary: OwnerSummary): number {
  return (
    getModongStateCount(summary, "โมดอง") +
    getModongStateCount(summary, "ต่อไม่เสร็จ") +
    getModongStateCount(summary, "ต่อแล้ว")
  );
}

export function getModongStateCount(
  summary: OwnerSummary,
  state: ModongState
): number {
  return summary.modongByState[state] ?? 0;
}

export function getWantedStateCount(
  summary: OwnerSummary,
  state: WantedState
): number {
  return summary.wantedByState[state] ?? 0;
}
