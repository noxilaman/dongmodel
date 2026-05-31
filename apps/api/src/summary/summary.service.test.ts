import {
  ModongState as PrismaModongState,
  WantedState as PrismaWantedState
} from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SummaryService } from "./summary.service";

function createPrismaMock() {
  return {
    modong: {
      groupBy: vi.fn()
    },
    wantedItem: {
      groupBy: vi.fn()
    }
  };
}

function createService() {
  const prisma = createPrismaMock();
  return {
    prisma,
    service: new SummaryService(prisma as never)
  };
}

describe("SummaryService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns owner-scoped counts and private value summaries", async () => {
    const { prisma, service } = createService();
    prisma.modong.groupBy
      .mockResolvedValueOnce([
        {
          state: PrismaModongState.MODONG,
          _count: { _all: 3 }
        },
        {
          state: PrismaModongState.RELEASED,
          _count: { _all: 1 }
        }
      ])
      .mockResolvedValueOnce([
        {
          purchaseCurrency: "THB",
          _sum: { purchaseAmount: { toString: () => "4500.00" } }
        },
        {
          purchaseCurrency: "JPY",
          _sum: { purchaseAmount: { toString: () => "12000.00" } }
        }
      ])
      .mockResolvedValueOnce([
        {
          releaseCurrency: "THB",
          _sum: { releaseAmount: { toString: () => "2000.00" } }
        }
      ]);
    prisma.wantedItem.groupBy.mockResolvedValueOnce([
      {
        state: PrismaWantedState.NEEDLE_HUNTING,
        _count: { _all: 2 }
      },
      {
        state: PrismaWantedState.BROKEN_UP,
        _count: { _all: 1 }
      }
    ]);

    const result = await service.show("owner-1");

    expect(prisma.modong.groupBy).toHaveBeenNthCalledWith(1, {
      by: ["state"],
      where: { ownerId: "owner-1" },
      _count: { _all: true }
    });
    expect(prisma.wantedItem.groupBy).toHaveBeenCalledWith({
      by: ["state"],
      where: { ownerId: "owner-1" },
      _count: { _all: true }
    });
    expect(result).toEqual({
      modongTotal: 4,
      wantedTotal: 3,
      modongByState: {
        โมดอง: 3,
        "ต่อไม่เสร็จ": 0,
        ต่อแล้ว: 0,
        ปล่อยไปแล้ว: 1,
        หลุมดำ: 0
      },
      wantedByState: {
        กำลังงมเข็ม: 2,
        "mission complete": 0,
        ห่างกันซักพัก: 0,
        เราขาดกัน: 1
      },
      privateValueSummary: {
        purchase: [
          { currency: "THB", amount: "4500.00" },
          { currency: "JPY", amount: "12000.00" }
        ],
        release: [{ currency: "THB", amount: "2000.00" }]
      }
    });
  });

  it("zero-fills missing states", async () => {
    const { prisma, service } = createService();
    prisma.modong.groupBy
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    prisma.wantedItem.groupBy.mockResolvedValueOnce([]);

    await expect(service.show("owner-1")).resolves.toMatchObject({
      modongTotal: 0,
      wantedTotal: 0,
      modongByState: {
        โมดอง: 0,
        "ต่อไม่เสร็จ": 0,
        ต่อแล้ว: 0,
        ปล่อยไปแล้ว: 0,
        หลุมดำ: 0
      },
      wantedByState: {
        กำลังงมเข็ม: 0,
        "mission complete": 0,
        ห่างกันซักพัก: 0,
        เราขาดกัน: 0
      }
    });
  });
});
