import { NotFoundException } from "@nestjs/common";
import { ModongState as PrismaModongState } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GalleryService } from "./gallery.service";

const now = new Date("2026-05-31T00:00:00.000Z");

function createPrismaMock() {
  return {
    owner: { findUnique: vi.fn() },
    modong: { findMany: vi.fn() }
  };
}

const prismaModong = {
  id: "modong-1",
  name: "MG Sazabi",
  state: PrismaModongState.MODONG,
  releaseYear: 2008,
  acquisitionYear: 2024,
  galleryVisible: true,
  createdAt: now,
  updatedAt: now,
  collectibleKind: { name: "Gunpla" },
  photos: [{ storageKey: "owner-1/abc.jpg" }]
};

describe("GalleryService", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("returns owner info and gallery-eligible Modong", async () => {
    const prisma = createPrismaMock();
    const service = new GalleryService(prisma as never);

    prisma.owner.findUnique.mockResolvedValue({
      id: "owner-1",
      displayName: "นาย Test",
      handle: "naytest"
    });
    prisma.modong.findMany.mockResolvedValue([prismaModong]);

    const result = await service.getOwnerGallery("naytest");

    expect(result.owner).toEqual({ displayName: "นาย Test", handle: "naytest" });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: "modong-1",
      name: "MG Sazabi",
      state: "โมดอง",
      collectibleKind: "Gunpla",
      mainPhotoUrl: "/uploads/owner-1/abc.jpg"
    });
  });

  it("filters only gallery-eligible states", async () => {
    const prisma = createPrismaMock();
    const service = new GalleryService(prisma as never);

    prisma.owner.findUnique.mockResolvedValue({ id: "owner-1", displayName: "Test", handle: "test" });
    prisma.modong.findMany.mockResolvedValue([]);

    await service.getOwnerGallery("test");

    expect(prisma.modong.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          galleryVisible: true,
          state: { in: ["MODONG", "UNFINISHED", "COMPLETED"] }
        })
      })
    );
  });

  it("throws NotFoundException for unknown handle", async () => {
    const prisma = createPrismaMock();
    const service = new GalleryService(prisma as never);
    prisma.owner.findUnique.mockResolvedValue(null);

    await expect(service.getOwnerGallery("nobody")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("returns null mainPhotoUrl when modong has no main photo", async () => {
    const prisma = createPrismaMock();
    const service = new GalleryService(prisma as never);

    prisma.owner.findUnique.mockResolvedValue({ id: "o-1", displayName: "T", handle: "t" });
    prisma.modong.findMany.mockResolvedValue([{ ...prismaModong, photos: [] }]);

    const result = await service.getOwnerGallery("t");

    expect(result.items[0]?.mainPhotoUrl).toBeNull();
  });
});
