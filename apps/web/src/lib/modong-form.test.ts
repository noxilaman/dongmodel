import { describe, expect, it } from "vitest";
import { buildCreateModongPayload, emptyModongForm } from "./modong-form";

describe("modong form helpers", () => {
  it("builds a minimal create payload", () => {
    expect(
      buildCreateModongPayload({
        ...emptyModongForm,
        name: " MG Sazabi "
      })
    ).toEqual({
      name: "MG Sazabi",
      state: "โมดอง",
      purchaseCurrency: "THB",
      releaseCurrency: "THB",
      galleryVisible: true
    });
  });

  it("keeps optional numeric and private fields when present", () => {
    expect(
      buildCreateModongPayload({
        ...emptyModongForm,
        name: "RG Nu",
        state: "ต่อไม่เสร็จ",
        releaseYear: "2019",
        acquisitionYear: "2024",
        releasedAwayYear: "2026",
        acquisitionSource: " ร้านประจำ ",
        purchaseAmount: "1500",
        purchaseCurrency: " jpy ",
        releaseAmount: "1200",
        releaseCurrency: " usd ",
        galleryVisible: false,
        storageNote: " ชั้นสอง ",
        privateNote: " ต่อหลัง MG "
      })
    ).toMatchObject({
      state: "ต่อไม่เสร็จ",
      releaseYear: 2019,
      acquisitionYear: 2024,
      releasedAwayYear: 2026,
      acquisitionSource: "ร้านประจำ",
      purchaseAmount: 1500,
      purchaseCurrency: "JPY",
      releaseAmount: 1200,
      releaseCurrency: "USD",
      galleryVisible: false,
      storageNote: "ชั้นสอง",
      privateNote: "ต่อหลัง MG"
    });
  });
});
