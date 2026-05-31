import { NotFoundException } from "@nestjs/common";
import { WantedState } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WantedListsService } from "./wanted-lists.service";

const now = new Date("2026-05-31T00:00:00.000Z");

const listRecord = {
  id: "list-1",
  ownerId: "owner-1",
  name: "ตามหา UC",
  createdAt: now,
  updatedAt: now,
  _count: { items: 2 }
};

function createPrismaMock() {
  return {
    wantedList: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  };
}

function createService() {
  const prisma = createPrismaMock();
  return {
    prisma,
    service: new WantedListsService(prisma as never)
  };
}

describe("WantedListsService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("lists owner-scoped Wanted Lists", async () => {
    const { prisma, service } = createService();
    prisma.wantedList.findMany.mockResolvedValue([listRecord]);

    const result = await service.list("owner-1");

    expect(prisma.wantedList.findMany).toHaveBeenCalledWith({
      where: { ownerId: "owner-1" },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } }
    });
    expect(result[0]).toEqual({
      id: "list-1",
      ownerId: "owner-1",
      name: "ตามหา UC",
      itemCount: 2,
      createdAt: "2026-05-31T00:00:00.000Z",
      updatedAt: "2026-05-31T00:00:00.000Z"
    });
  });

  it("creates a Wanted List for the current owner", async () => {
    const { prisma, service } = createService();
    prisma.wantedList.create.mockResolvedValue(listRecord);

    await service.create("owner-1", { name: "ตามหา UC" });

    expect(prisma.wantedList.create).toHaveBeenCalledWith({
      data: {
        ownerId: "owner-1",
        name: "ตามหา UC"
      },
      include: { _count: { select: { items: true } } }
    });
  });

  it("updates only owner-owned Wanted List", async () => {
    const { prisma, service } = createService();
    prisma.wantedList.findFirst.mockResolvedValue({ id: "list-1" });
    prisma.wantedList.update.mockResolvedValue({
      ...listRecord,
      name: "ตามหา P-Bandai"
    });

    const result = await service.update("owner-1", "list-1", {
      name: "ตามหา P-Bandai"
    });

    expect(prisma.wantedList.update).toHaveBeenCalledWith({
      where: { id: "list-1" },
      data: { name: "ตามหา P-Bandai" },
      include: { _count: { select: { items: true } } }
    });
    expect(result.name).toBe("ตามหา P-Bandai");
  });

  it("throws NotFound for another owner's list", async () => {
    const { prisma, service } = createService();
    prisma.wantedList.findFirst.mockResolvedValue(null);

    await expect(
      service.update("owner-1", "list-1", { name: "New list" })
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.wantedList.update).not.toHaveBeenCalled();
  });

  it("returns list details with Wanted Items", async () => {
    const { prisma, service } = createService();
    prisma.wantedList.findFirst.mockResolvedValue({
      ...listRecord,
      items: [
        {
          id: "wanted-1",
          name: "HG Nightingale",
          state: WantedState.NEEDLE_HUNTING
        }
      ]
    });

    const result = await service.get("owner-1", "list-1");

    expect(result.items).toEqual([
      {
        id: "wanted-1",
        name: "HG Nightingale",
        state: WantedState.NEEDLE_HUNTING
      }
    ]);
  });
});
