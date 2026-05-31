import { NotFoundException } from "@nestjs/common";
import {
  ModongState as PrismaModongState,
  WantedState as PrismaWantedState
} from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WantedService } from "./wanted.service";

const now = new Date("2026-05-31T00:00:00.000Z");

const prismaWanted = {
  id: "wanted-1",
  ownerId: "owner-1",
  collectibleKindId: "kind-1",
  wantedListId: "list-1",
  acquiredModongId: null,
  name: "HG Nightingale",
  state: PrismaWantedState.NEEDLE_HUNTING,
  wantedNote: "อย่าเกินงบ",
  createdAt: now,
  updatedAt: now,
  collectibleKind: {
    id: "kind-1",
    name: "Gunpla"
  },
  wantedList: {
    id: "list-1",
    name: "ตามหา UC"
  },
  acquiredModong: null
};

function createPrismaMock() {
  return {
    wantedItem: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    modong: {
      create: vi.fn()
    },
    $transaction: vi.fn()
  };
}

function createService() {
  const prisma = createPrismaMock();
  prisma.$transaction.mockImplementation((callback) => callback(prisma));
  return {
    prisma,
    service: new WantedService(prisma as never)
  };
}

describe("WantedService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("lists owner-scoped Wanted Items and maps state to domain state", async () => {
    const { prisma, service } = createService();
    prisma.wantedItem.findMany.mockResolvedValue([prismaWanted]);

    const result = await service.list("owner-1", {
      state: "กำลังงมเข็ม",
      q: "Nightingale"
    });

    expect(prisma.wantedItem.findMany).toHaveBeenCalledWith({
      where: {
        ownerId: "owner-1",
        name: { contains: "Nightingale" },
        state: PrismaWantedState.NEEDLE_HUNTING
      },
      orderBy: { createdAt: "desc" },
      include: expect.any(Object)
    });
    expect(result[0]).toEqual({
      id: "wanted-1",
      ownerId: "owner-1",
      name: "HG Nightingale",
      state: "กำลังงมเข็ม",
      collectibleKind: { id: "kind-1", name: "Gunpla" },
      wantedList: { id: "list-1", name: "ตามหา UC" },
      acquiredModong: null,
      wantedNote: "อย่าเกินงบ",
      createdAt: "2026-05-31T00:00:00.000Z",
      updatedAt: "2026-05-31T00:00:00.000Z"
    });
  });

  it("creates a normal Wanted Item for the current owner", async () => {
    const { prisma, service } = createService();
    prisma.wantedItem.create.mockResolvedValue(prismaWanted);

    const result = await service.create("owner-1", {
      name: "HG Nightingale",
      state: "กำลังงมเข็ม",
      collectibleKindId: "kind-1",
      wantedListId: "list-1",
      wantedNote: "อย่าเกินงบ"
    });

    expect(prisma.wantedItem.create).toHaveBeenCalledWith({
      data: {
        ownerId: "owner-1",
        name: "HG Nightingale",
        state: PrismaWantedState.NEEDLE_HUNTING,
        collectibleKindId: "kind-1",
        wantedListId: "list-1",
        wantedNote: "อย่าเกินงบ"
      },
      include: expect.any(Object)
    });
    expect(result.state).toBe("กำลังงมเข็ม");
  });

  it("creates a Modong immediately when creating Mission Complete", async () => {
    const { prisma, service } = createService();
    prisma.modong.create.mockResolvedValue({ id: "modong-1" });
    prisma.wantedItem.create.mockResolvedValue({
      ...prismaWanted,
      state: PrismaWantedState.MISSION_COMPLETE,
      acquiredModongId: "modong-1",
      acquiredModong: { id: "modong-1", name: "HG Nightingale" }
    });

    const result = await service.create("owner-1", {
      name: "HG Nightingale",
      state: "mission complete",
      collectibleKindId: "kind-1"
    });

    expect(prisma.modong.create).toHaveBeenCalledWith({
      data: {
        ownerId: "owner-1",
        name: "HG Nightingale",
        state: PrismaModongState.MODONG,
        collectibleKindId: "kind-1",
        galleryVisible: true
      },
      select: { id: true }
    });
    expect(prisma.wantedItem.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ownerId: "owner-1",
        state: PrismaWantedState.MISSION_COMPLETE,
        acquiredModongId: "modong-1"
      }),
      include: expect.any(Object)
    });
    expect(result.state).toBe("mission complete");
    expect(result.acquiredModong).toEqual({
      id: "modong-1",
      name: "HG Nightingale"
    });
  });

  it("updates to Mission Complete by creating a Modong", async () => {
    const { prisma, service } = createService();
    prisma.wantedItem.findFirst.mockResolvedValueOnce({
      id: "wanted-1",
      acquiredModongId: null
    });
    prisma.wantedItem.findFirst.mockResolvedValueOnce({
      id: "wanted-1",
      name: "HG Nightingale",
      collectibleKindId: "kind-1",
      acquiredModongId: null
    });
    prisma.modong.create.mockResolvedValue({ id: "modong-1" });
    prisma.wantedItem.update.mockResolvedValue({
      ...prismaWanted,
      state: PrismaWantedState.MISSION_COMPLETE,
      acquiredModongId: "modong-1",
      acquiredModong: { id: "modong-1", name: "HG Nightingale" }
    });

    const result = await service.update("owner-1", "wanted-1", {
      state: "mission complete"
    });

    expect(prisma.modong.create).toHaveBeenCalledWith({
      data: {
        ownerId: "owner-1",
        name: "HG Nightingale",
        state: PrismaModongState.MODONG,
        collectibleKindId: "kind-1",
        galleryVisible: true
      },
      select: { id: true }
    });
    expect(result.acquiredModong).toEqual({
      id: "modong-1",
      name: "HG Nightingale"
    });
  });

  it("does not create a second Modong for already acquired Wanted Item", async () => {
    const { prisma, service } = createService();
    prisma.wantedItem.findFirst.mockResolvedValue({
      id: "wanted-1",
      acquiredModongId: "modong-1"
    });
    prisma.wantedItem.update.mockResolvedValue({
      ...prismaWanted,
      state: PrismaWantedState.MISSION_COMPLETE,
      acquiredModongId: "modong-1",
      acquiredModong: { id: "modong-1", name: "HG Nightingale" }
    });

    await service.update("owner-1", "wanted-1", {
      state: "mission complete",
      wantedNote: "ได้มาแล้ว"
    });

    expect(prisma.modong.create).not.toHaveBeenCalled();
    expect(prisma.wantedItem.update).toHaveBeenCalledWith({
      where: { id: "wanted-1" },
      data: {
        state: PrismaWantedState.MISSION_COMPLETE,
        wantedNote: "ได้มาแล้ว"
      },
      include: expect.any(Object)
    });
  });

  it("throws NotFound when updating another owner's Wanted Item", async () => {
    const { prisma, service } = createService();
    prisma.wantedItem.findFirst.mockResolvedValue(null);

    await expect(
      service.update("owner-1", "wanted-1", { name: "New name" })
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.wantedItem.update).not.toHaveBeenCalled();
  });

  it("deletes only owner-owned Wanted Item", async () => {
    const { prisma, service } = createService();
    prisma.wantedItem.findFirst.mockResolvedValue({
      id: "wanted-1",
      acquiredModongId: null
    });
    prisma.wantedItem.delete.mockResolvedValue(prismaWanted);

    await expect(service.delete("owner-1", "wanted-1")).resolves.toEqual({
      ok: true
    });
    expect(prisma.wantedItem.delete).toHaveBeenCalledWith({
      where: { id: "wanted-1" }
    });
  });
});
