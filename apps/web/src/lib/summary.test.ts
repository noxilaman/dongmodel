import { describe, expect, it } from "vitest";
import { formatValueSummary, getActiveSummaryTotal } from "./summary";

describe("summary helpers", () => {
  it("formats empty private values without exposing fake numbers", () => {
    expect(formatValueSummary([])).toBe("-");
  });

  it("formats private value totals by currency", () => {
    expect(
      formatValueSummary([
        { amount: "2500.00", currency: "THB" },
        { amount: "12000.00", currency: "JPY" }
      ])
    ).toBe("2500.00 THB / 12000.00 JPY");
  });

  it("counts active collection states for dashboard emphasis", () => {
    expect(
      getActiveSummaryTotal({
        modongTotal: 5,
        wantedTotal: 1,
        modongByState: {
          โมดอง: 2,
          "ต่อไม่เสร็จ": 1,
          ต่อแล้ว: 1,
          ปล่อยไปแล้ว: 1,
          หลุมดำ: 0
        },
        wantedByState: {
          กำลังงมเข็ม: 1,
          "mission complete": 0,
          ห่างกันซักพัก: 0,
          เราขาดกัน: 0
        },
        privateValueSummary: {
          purchase: [],
          release: []
        }
      })
    ).toBe(4);
  });
});
