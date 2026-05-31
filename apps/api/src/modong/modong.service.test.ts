import { NotFoundException } from "@nestjs/common";
import { ModongState as PrismaModongState } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModongService } from "./modong.service";

const now = new Date("2026-05-31T00:00:00.000Z");

const prismaModong = {
  id: "modong-1",
  ownerId: "owner-1",
  collectibleKindId: "kind-1",
  name: "MG Sazabi",
  state: PrismaModongState.MODONG,
  releaseYear: 2008,
  acquisitionYear: 2024,
  releasedAwayYear: null,
  acquisitionSource: "ร้านประจำ",
  storageNote: "กล่องแดง",
  privateNote: "ต่อหลัง RG",
  purchaseAmount: { toString: () => "2500" },
  purchaseCurrency: "THB",
  releaseAmount: null,
  releaseCurrency: "THB",
  galleryVisible: true,
  createdAt: now,
  updatedAt: now,
  collectibleKind: {
    id: "kind-1",
    name: "Gunpla"
  }
};

function createPrismaMock() {
  return {
    modong: {
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
    service: new ModongService(prisma as never)
  };
}

describe("ModongService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("lists owner-scoped Modong and maps Prisma state to domain state", async () => {
    const { prisma, service } = createService();
    prisma.modong.findMany.mockResolvedValue([prismaModong]);

    const result = await service.list("owner-1", {
      state: "โมดอง",
      q: "Sazabi"
    });

    expect(prisma.modong.findMany).toHaveBeenCalledWith({
      where: {
        ownerId: "owner-1",
        name: { contains: "Sazabi" },
        state: PrismaModongState.MODONG
      },
      orderBy: { createdAt: "desc" },
      include: { collectibleKind: true }
    });
    expect(result[0]).toEqual({
      id: "modong-1",
      ownerId: "owner-1",
      name: "MG Sazabi",
      state: "โมดอง",
      collectibleKind: { id: "kind-1", name: "Gunpla" },
      releaseYear: 2008,
      acquisitionYear: 2024,
      releasedAwayYear: null,
      acquisitionSource: "ร้านประจำ",
      storageNote: "กล่องแดง",
      privateNote: "ต่อหลัง RG",
      purchaseAmount: "2500",
      purchaseCurrency: "THB",
      releaseAmount: null,
      releaseCurrency: "THB",
      galleryVisible: true,
      createdAt: "2026-05-31T00:00:00.000Z",
      updatedAt: "2026-05-31T00:00:00.000Z"
    });
  });

  it("creates a Modong for the current owner", async () => {
    const { prisma, service } = createService();
    prisma.modong.create.mockResolvedValue(prismaModong);

    const result = await service.create("owner-1", {
      name: "MG Sazabi",
      state: "โมดอง",
      collectibleKindId: "kind-1",
      releaseYear: 2008,
      acquisitionYear: 2024,
      acquisitionSource: "ร้านประจำ",
      storageNote: "กล่องแดง",
      privateNote: "ต่อหลัง RG",
      purchaseAmount: 2500,
      purchaseCurrency: "THB",
      releaseCurrency: "THB",
      galleryVisible: true
    });

    expect(prisma.modong.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ownerId: "owner-1",
        name: "MG Sazabi",
        state: PrismaModongState.MODONG,
        collectibleKindId: "kind-1",
        purchaseAmount: 2500
      }),
      include: { collectibleKind: true }
    });
    expect(result.state).toBe("โมดอง");
  });

  it("updates only owner-owned Modong", async () => {
    const { prisma, service } = createService();
    prisma.modong.findFirst.mockResolvedValue({ id: "modong-1" });
    prisma.modong.update.mockResolvedValue({
      ...prismaModong,
      state: PrismaModongState.UNFINISHED
    });

    const result = await service.update("owner-1", "modong-1", {
      state: "ต่อไม่เสร็จ",
      privateNote: "เหลืออาวุธ"
    });

    expect(prisma.modong.findFirst).toHaveBeenCalledWith({
      where: { id: "modong-1", ownerId: "owner-1" },
      select: { id: true }
    });
    expect(prisma.modong.update).toHaveBeenCalledWith({
      where: { id: "modong-1" },
      data: {
        state: PrismaModongState.UNFINISHED,
        privateNote: "เหลืออาวุธ"
      },
      include: { collectibleKind: true }
    });
    expect(result.state).toBe("ต่อไม่เสร็จ");
  });

  it("throws NotFound when updating another owner's Modong", async () => {
    const { prisma, service } = createService();
    prisma.modong.findFirst.mockResolvedValue(null);

    await expect(
      service.update("owner-1", "modong-1", { name: "New name" })
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.modong.update).not.toHaveBeenCalled();
  });

  it("deletes only owner-owned Modong", async () => {
    const { prisma, service } = createService();
    prisma.modong.findFirst.mockResolvedValue({ id: "modong-1" });
    prisma.modong.delete.mockResolvedValue(prismaModong);

    await expect(service.delete("owner-1", "modong-1")).resolves.toEqual({
      ok: true
    });
    expect(prisma.modong.delete).toHaveBeenCalledWith({
      where: { id: "modong-1" }
    });
  });
});
