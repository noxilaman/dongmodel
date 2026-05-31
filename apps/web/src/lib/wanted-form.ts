import type { CreateWantedItemInput, WantedState } from "@dongmodel/shared";

export type WantedFormState = {
  name: string;
  state: WantedState;
  collectibleKindId: string;
  wantedNote: string;
};

export const emptyWantedForm: WantedFormState = {
  name: "",
  state: "กำลังงมเข็ม",
  collectibleKindId: "",
  wantedNote: ""
};

export function buildCreateWantedPayload(
  form: WantedFormState
): CreateWantedItemInput {
  const payload: CreateWantedItemInput = {
    name: form.name.trim(),
    state: form.state
  };

  if (form.collectibleKindId) {
    payload.collectibleKindId = form.collectibleKindId;
  }

  const note = form.wantedNote.trim();
  if (note) {
    payload.wantedNote = note;
  }

  return payload;
}
