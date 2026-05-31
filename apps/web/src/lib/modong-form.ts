import type { CreateModongInput, ModongState } from "@dongmodel/shared";

export type ModongFormState = {
  name: string;
  state: ModongState;
  collectibleKindId: string;
  releaseYear: string;
  acquisitionYear: string;
  storageNote: string;
  privateNote: string;
  purchaseAmount: string;
  purchaseCurrency: string;
};

export const emptyModongForm: ModongFormState = {
  name: "",
  state: "โมดอง",
  collectibleKindId: "",
  releaseYear: "",
  acquisitionYear: "",
  storageNote: "",
  privateNote: "",
  purchaseAmount: "",
  purchaseCurrency: "THB"
};

export function buildCreateModongPayload(
  form: ModongFormState
): CreateModongInput {
  const payload: CreateModongInput = {
    name: form.name.trim(),
    state: form.state,
    purchaseCurrency: normalizeCurrency(form.purchaseCurrency),
    releaseCurrency: "THB",
    galleryVisible: true
  };

  if (form.collectibleKindId) {
    payload.collectibleKindId = form.collectibleKindId;
  }

  addOptionalNumber(payload, "releaseYear", form.releaseYear);
  addOptionalNumber(payload, "acquisitionYear", form.acquisitionYear);
  addOptionalNumber(payload, "purchaseAmount", form.purchaseAmount);
  addOptionalText(payload, "storageNote", form.storageNote);
  addOptionalText(payload, "privateNote", form.privateNote);

  return payload;
}

function normalizeCurrency(value: string): string {
  const normalized = value.trim().toUpperCase();
  return normalized.length === 3 ? normalized : "THB";
}

function addOptionalText<Key extends "storageNote" | "privateNote">(
  payload: CreateModongInput,
  key: Key,
  value: string
) {
  const trimmed = value.trim();
  if (trimmed) {
    payload[key] = trimmed;
  }
}

function addOptionalNumber<
  Key extends "releaseYear" | "acquisitionYear" | "purchaseAmount"
>(payload: CreateModongInput, key: Key, value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return;
  }

  const parsed = Number(trimmed);
  if (Number.isFinite(parsed)) {
    payload[key] = parsed;
  }
}
