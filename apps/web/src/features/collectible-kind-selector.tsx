"use client";

import { useEffect, useState } from "react";
import { listCollectibleKinds, type CollectibleKind } from "../lib/api";

type Props = {
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
};

export function CollectibleKindSelector({ value, onChange, disabled }: Props) {
  const [kinds, setKinds] = useState<CollectibleKind[]>([]);

  useEffect(() => {
    listCollectibleKinds()
      .then((items) => setKinds(items.filter((k) => k.isActive)))
      .catch(() => {
        // non-critical — selector stays empty
      });
  }, []);

  if (kinds.length === 0) return null;

  return (
    <label className="grid gap-1 text-sm font-semibold">
      <span>ประเภทสิ่งของ</span>
      <select
        className="h-11 rounded-md border border-border bg-white px-3 text-base outline-none focus:border-accent"
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        value={value}
      >
        <option value="">— ไม่ระบุ —</option>
        {kinds.map((k) => (
          <option key={k.id} value={k.id}>
            {k.name}
          </option>
        ))}
      </select>
    </label>
  );
}
