import { z } from "zod";
import { modongStates, wantedStates } from "./domain.js";

export const modongStateSchema = z.enum(modongStates);
export const wantedStateSchema = z.enum(wantedStates);

export const createModongSchema = z.object({
  name: z.string().trim().min(1),
  state: modongStateSchema.default("โมดอง"),
  collectibleKindId: z.string().uuid().optional()
});

export const createWantedItemSchema = z.object({
  name: z.string().trim().min(1),
  state: wantedStateSchema.default("กำลังงมเข็ม"),
  collectibleKindId: z.string().uuid().optional(),
  wantedListId: z.string().uuid().optional()
});

export type CreateModongInput = z.infer<typeof createModongSchema>;
export type CreateWantedItemInput = z.infer<typeof createWantedItemSchema>;
