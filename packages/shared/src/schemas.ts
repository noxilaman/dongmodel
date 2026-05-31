import { z } from "zod";
import { modongStates, wantedStates } from "./domain.js";

export const modongStateSchema = z.enum(modongStates);
export const wantedStateSchema = z.enum(wantedStates);

export const createModongSchema = z.object({
  name: z.string().trim().min(1),
  state: modongStateSchema.default("โมดอง"),
  collectibleKindId: z.string().uuid().optional(),
  releaseYear: z.coerce.number().int().min(1900).max(3000).optional(),
  acquisitionYear: z.coerce.number().int().min(1900).max(3000).optional(),
  releasedAwayYear: z.coerce.number().int().min(1900).max(3000).optional(),
  acquisitionSource: z.string().trim().max(5000).optional(),
  storageNote: z.string().trim().max(5000).optional(),
  privateNote: z.string().trim().max(5000).optional(),
  purchaseAmount: z.coerce.number().nonnegative().optional(),
  purchaseCurrency: z.string().trim().length(3).default("THB"),
  releaseAmount: z.coerce.number().nonnegative().optional(),
  releaseCurrency: z.string().trim().length(3).default("THB"),
  galleryVisible: z.boolean().default(true)
});

export const updateModongSchema = createModongSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  });

export const listModongQuerySchema = z.object({
  q: z.string().trim().optional(),
  state: modongStateSchema.optional(),
  collectibleKindId: z.string().uuid().optional(),
  releaseYear: z.coerce.number().int().min(1900).max(3000).optional(),
  acquisitionYear: z.coerce.number().int().min(1900).max(3000).optional()
});

export const createWantedItemSchema = z.object({
  name: z.string().trim().min(1),
  state: wantedStateSchema.default("กำลังงมเข็ม"),
  collectibleKindId: z.string().uuid().optional(),
  wantedListId: z.string().uuid().optional(),
  wantedNote: z.string().trim().max(5000).optional()
});

export const updateWantedItemSchema = createWantedItemSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  });

export const listWantedItemsQuerySchema = z.object({
  q: z.string().trim().optional(),
  state: wantedStateSchema.optional(),
  collectibleKindId: z.string().uuid().optional(),
  wantedListId: z.string().uuid().optional()
});

export const registerOwnerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().trim().min(1).max(80),
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/)
});

export const loginOwnerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128)
});

export type CreateModongInput = z.infer<typeof createModongSchema>;
export type UpdateModongInput = z.infer<typeof updateModongSchema>;
export type ListModongQuery = z.infer<typeof listModongQuerySchema>;
export type CreateWantedItemInput = z.infer<typeof createWantedItemSchema>;
export type UpdateWantedItemInput = z.infer<typeof updateWantedItemSchema>;
export type ListWantedItemsQuery = z.infer<typeof listWantedItemsQuerySchema>;
export type RegisterOwnerInput = z.infer<typeof registerOwnerSchema>;
export type LoginOwnerInput = z.infer<typeof loginOwnerSchema>;
