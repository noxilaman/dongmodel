import {
  BadRequestException,
  NotFoundException
} from "@nestjs/common";
import { PhotoKind } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PhotoService } from "./photo.service";

const now = new Date("2026-05-31T00:00:00.000Z");

const imageFile = {
  originalname: "sazabi.jpg",
  mimetype: "image/jpeg",
  size: 1234,
  buffer: Buffer.from("image")
} as Express.Multer.File;

const photoRecord = {
  id: "photo-1",
  ownerId: "owner-1",
  modongId: "modong-1",
  wantedItemId: null,
  kind: PhotoKind.MODONG_MAIN,
  storageKey: "owner-1/photo.jpg",
  originalName: "sazabi.jpg",
  mimeType: "image/jpeg",
  sizeBytes: 1234,
  sortOrder: 0,
  createdAt: now
};

function createPrismaMock() {
  return {
    modong: {
      findFirst: vi.fn()
    },
    wantedItem: {
      findFirst: vi.fn()
    },
    photo: {
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  };
}

function createStorageMock() {
  return {
    save: vi.fn().mockResolvedValue("owner-1/new-photo.jpg"),
    delete: vi.fn().mockResolvedValue(undefined)
  };
}

function createService() {
  const prisma = createPrismaMock();
  const storage = createStorageMock();
  return {
    prisma,
    storage,
    service: new PhotoService(prisma as never, storage as never)
  };
}

describe("PhotoService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("uploads a new Main Photo for an owned Modong", async () => {
    const { prisma, storage, service } = createService();
    prisma.modong.findFirst.mockResolvedValue({ id: "modong-1" });
    prisma.photo.findFirst.mockResolvedValue(null);
    prisma.photo.create.mockResolvedValue(photoRecord);

    const result = await service.uploadMainPhoto("owner-1", "modong-1", imageFile);

    expect(storage.save).toHaveBeenCalledWith("owner-1", imageFile);
    expect(prisma.photo.create).toHaveBeenCalledWith({
      data: {
        ownerId: "owner-1",
        storageKey: "owner-1/new-photo.jpg",
        originalName: "sazabi.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 1234,
        modongId: "modong-1",
        kind: PhotoKind.MODONG_MAIN
      }
    });
    expect(result.kind).toBe(PhotoKind.MODONG_MAIN);
  });

  it("replaces an existing Main Photo and deletes the old file", async () => {
    const { prisma, storage, service } = createService();
    prisma.modong.findFirst.mockResolvedValue({ id: "modong-1" });
    prisma.photo.findFirst.mockResolvedValue(photoRecord);
    prisma.photo.update.mockResolvedValue({
      ...photoRecord,
      storageKey: "owner-1/new-photo.jpg"
    });

    await service.uploadMainPhoto("owner-1", "modong-1", imageFile);

    expect(prisma.photo.update).toHaveBeenCalledWith({
      where: { id: "photo-1" },
      data: {
        ownerId: "owner-1",
        storageKey: "owner-1/new-photo.jpg",
        originalName: "sazabi.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 1234
      }
    });
    expect(storage.delete).toHaveBeenCalledWith("owner-1/photo.jpg");
  });

  it("limits Additional Photos to five per Modong", async () => {
    const { prisma, service } = createService();
    prisma.modong.findFirst.mockResolvedValue({ id: "modong-1" });
    prisma.photo.count.mockResolvedValue(5);

    await expect(
      service.uploadAdditionalPhoto("owner-1", "modong-1", imageFile)
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.photo.create).not.toHaveBeenCalled();
  });

  it("creates Additional Photos with the next sort order", async () => {
    const { prisma, service } = createService();
    prisma.modong.findFirst.mockResolvedValue({ id: "modong-1" });
    prisma.photo.count.mockResolvedValue(2);
    prisma.photo.create.mockResolvedValue({
      ...photoRecord,
      kind: PhotoKind.MODONG_ADDITIONAL,
      sortOrder: 2
    });

    const result = await service.uploadAdditionalPhoto(
      "owner-1",
      "modong-1",
      imageFile
    );

    expect(prisma.photo.create).toHaveBeenCalledWith({
      data: {
        ownerId: "owner-1",
        storageKey: "owner-1/new-photo.jpg",
        originalName: "sazabi.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 1234,
        modongId: "modong-1",
        kind: PhotoKind.MODONG_ADDITIONAL,
        sortOrder: 2
      }
    });
    expect(result.kind).toBe(PhotoKind.MODONG_ADDITIONAL);
  });

  it("replaces a Wanted Reference Photo", async () => {
    const { prisma, storage, service } = createService();
    prisma.wantedItem.findFirst.mockResolvedValue({ id: "wanted-1" });
    prisma.photo.findFirst.mockResolvedValue({
      ...photoRecord,
      modongId: null,
      wantedItemId: "wanted-1",
      kind: PhotoKind.WANTED_REFERENCE
    });
    prisma.photo.update.mockResolvedValue({
      ...photoRecord,
      modongId: null,
      wantedItemId: "wanted-1",
      kind: PhotoKind.WANTED_REFERENCE,
      storageKey: "owner-1/new-photo.jpg"
    });

    const result = await service.uploadWantedReferencePhoto(
      "owner-1",
      "wanted-1",
      imageFile
    );

    expect(result.kind).toBe(PhotoKind.WANTED_REFERENCE);
    expect(storage.delete).toHaveBeenCalledWith("owner-1/photo.jpg");
  });

  it("rejects non-image files", async () => {
    const { service } = createService();
    const file = {
      ...imageFile,
      mimetype: "text/plain"
    } as Express.Multer.File;

    await expect(
      service.uploadMainPhoto("owner-1", "modong-1", file)
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("throws NotFound for another owner's Modong", async () => {
    const { prisma, service } = createService();
    prisma.modong.findFirst.mockResolvedValue(null);

    await expect(
      service.uploadMainPhoto("owner-1", "modong-1", imageFile)
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("deletes an owned Photo and stored file", async () => {
    const { prisma, storage, service } = createService();
    prisma.photo.findFirst.mockResolvedValue(photoRecord);
    prisma.photo.delete.mockResolvedValue(photoRecord);

    await expect(service.delete("owner-1", "photo-1")).resolves.toEqual({
      ok: true
    });
    expect(prisma.photo.delete).toHaveBeenCalledWith({
      where: { id: "photo-1" }
    });
    expect(storage.delete).toHaveBeenCalledWith("owner-1/photo.jpg");
  });
});
