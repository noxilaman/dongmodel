import { describe, expect, it } from "vitest";
import {
  createModongSchema,
  createWantedItemSchema,
  loginOwnerSchema,
  modongGroupMembershipSchema,
  registerOwnerSchema,
  createModongGroupSchema,
  createWantedListSchema
} from "./schemas.js";

describe("shared schemas", () => {
  it("defaults new Modong to the Modong state", () => {
    const result = createModongSchema.parse({ name: "MG Sazabi" });

    expect(result).toEqual({
      name: "MG Sazabi",
      state: "โมดอง",
      purchaseCurrency: "THB",
      releaseCurrency: "THB",
      galleryVisible: true
    });
  });

  it("coerces Modong numeric fields and accepts boolean visibility", () => {
    const result = createModongSchema.parse({
      name: "MG Sazabi",
      releaseYear: "2008",
      purchaseAmount: "2500",
      galleryVisible: false
    });

    expect(result.releaseYear).toBe(2008);
    expect(result.purchaseAmount).toBe(2500);
    expect(result.galleryVisible).toBe(false);
  });

  it("defaults new Wanted Item to Needle Hunting", () => {
    const result = createWantedItemSchema.parse({ name: "HG Nightingale" });

    expect(result).toEqual({
      name: "HG Nightingale",
      state: "กำลังงมเข็ม"
    });
  });

  it("accepts Wanted Item note and list fields", () => {
    const result = createWantedItemSchema.parse({
      name: "HG Nightingale",
      wantedListId: "11111111-1111-4111-8111-111111111111",
      wantedNote: "ไม่เกินงบที่ตั้งไว้"
    });

    expect(result.wantedListId).toBe("11111111-1111-4111-8111-111111111111");
    expect(result.wantedNote).toBe("ไม่เกินงบที่ตั้งไว้");
  });

  it("normalizes owner registration identity fields", () => {
    const result = registerOwnerSchema.parse({
      email: "NOXIL@EXAMPLE.COM ",
      password: "password123",
      displayName: " พี่นอ ",
      handle: " NOXIL_01 "
    });

    expect(result).toEqual({
      email: "noxil@example.com",
      password: "password123",
      displayName: "พี่นอ",
      handle: "noxil_01"
    });
  });

  it("rejects unsafe owner handles", () => {
    const result = registerOwnerSchema.safeParse({
      email: "noxil@example.com",
      password: "password123",
      displayName: "พี่นอ",
      handle: "no-xil"
    });

    expect(result.success).toBe(false);
  });

  it("normalizes login email", () => {
    const result = loginOwnerSchema.parse({
      email: "NOXIL@EXAMPLE.COM ",
      password: "password123"
    });

    expect(result.email).toBe("noxil@example.com");
  });

  it("normalizes Modong Group input", () => {
    const result = createModongGroupSchema.parse({
      name: " กองสุลต่าน ",
      note: " เอาไว้อวด "
    });

    expect(result).toEqual({
      name: "กองสุลต่าน",
      note: "เอาไว้อวด"
    });
  });

  it("validates Modong Group membership", () => {
    const result = modongGroupMembershipSchema.parse({
      modongId: "11111111-1111-4111-8111-111111111111"
    });

    expect(result.modongId).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("normalizes Wanted List input", () => {
    const result = createWantedListSchema.parse({
      name: " ตามหา UC "
    });

    expect(result.name).toBe("ตามหา UC");
  });
});
