import type { CreateModongInput, ModongState } from "@dongmodel/shared";

export type ModongFormState = {
  name: string;
  state: ModongState;
  collectibleKindId: string;
  releaseYear: string;
  acquisitionYear: string;
  releasedAwayYear: string;
  acquisitionSource: string;
  storageNote: string;
  privateNote: string;
  purchaseAmount: string;
  purchaseCurrency: string;
  releaseAmount: string;
  releaseCurrency: string;
  galleryVisible: boolean;
};

export const emptyModongForm: ModongFormState = {
  name: "",
  state: "โมดอง",
  collectibleKindId: "",
  releaseYear: "",
  acquisitionYear: "",
  releasedAwayYear: "",
  acquisitionSource: "",
  storageNote: "",
  privateNote: "",
  purchaseAmount: "",
  purchaseCurrency: "THB",
  releaseAmount: "",
  releaseCurrency: "THB",
  galleryVisible: true
};

export function buildCreateModongPayload(
  form: ModongFormState
): CreateModongInput {
  const payload: CreateModongInput = {
    name: form.name.trim(),
    state: form.state,
    purchaseCurrency: normalizeCurrency(form.purchaseCurrency),
    releaseCurrency: normalizeCurrency(form.releaseCurrency),
    galleryVisible: form.galleryVisible
  };

  if (form.collectibleKindId) {
    payload.collectibleKindId = form.collectibleKindId;
  }

  addOptionalNumber(payload, "releaseYear", form.releaseYear);
  addOptionalNumber(payload, "acquisitionYear", form.acquisitionYear);
  addOptionalNumber(payload, "releasedAwayYear", form.releasedAwayYear);
  addOptionalNumber(payload, "purchaseAmount", form.purchaseAmount);
  addOptionalNumber(payload, "releaseAmount", form.releaseAmount);
  addOptionalText(payload, "acquisitionSource", form.acquisitionSource);
  addOptionalText(payload, "storageNote", form.storageNote);
  addOptionalText(payload, "privateNote", form.privateNote);

  return payload;
}

function normalizeCurrency(value: string): string {
  const normalized = value.trim().toUpperCase();
  return normalized.length === 3 ? normalized : "THB";
}

function addOptionalText<
  Key extends "acquisitionSource" | "storageNote" | "privateNote"
>(
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
  Key extends
    | "releaseYear"
    | "acquisitionYear"
    | "releasedAwayYear"
    | "purchaseAmount"
    | "releaseAmount"
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
