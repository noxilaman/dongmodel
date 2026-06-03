import { ForbiddenException, NotFoundException } from "@nestjs/common";
import {
  ModongState as PrismaModongState,
  WantedState as PrismaWantedState
} from "@prisma/client";
import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ShareService } from "./share.service";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

const now = new Date("2026-05-31T00:00:00.000Z");

function createPrismaMock() {
  return {
    share: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn()
    },
    modong: { findFirst: vi.fn(), findUnique: vi.fn() },
    modongGroup: { findFirst: vi.fn(), findUnique: vi.fn() },
    wantedItem: { findFirst: vi.fn(), findUnique: vi.fn() }
  };
}

describe("ShareService", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("creates a Modong share and returns a token", async () => {
    const prisma = createPrismaMock();
    const service = new ShareService(prisma as never);

    prisma.modong.findFirst.mockResolvedValue({ id: "modong-1" });
    prisma.share.findFirst.mockResolvedValue(null);
    prisma.share.create.mockResolvedValue({});

    const result = await service.createModongShare("owner-1", "modong-1");

    expect(result).toHaveProperty("token");
    expect(typeof result.token).toBe("string");
    expect(prisma.share.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ownerId: "owner-1",
          kind: "MODONG",
          modongId: "modong-1"
        })
      })
    );
  });

  it("revokes existing share before creating a new one for same target", async () => {
    const prisma = createPrismaMock();
    const service = new ShareService(prisma as never);

    prisma.modong.findFirst.mockResolvedValue({ id: "modong-1" });
    prisma.share.findFirst.mockResolvedValue({ id: "old-share" });
    prisma.share.update.mockResolvedValue({});
    prisma.share.create.mockResolvedValue({});

    await service.createModongShare("owner-1", "modong-1");

    expect(prisma.share.update).toHaveBeenCalledWith({
      where: { id: "old-share" },
      data: { revokedAt: expect.any(Date) }
    });
  });

  it("creates a group share with owner-selected featured Modong", async () => {
    const prisma = createPrismaMock();
    const service = new ShareService(prisma as never);

    prisma.modongGroup.findFirst.mockResolvedValue({
      id: "group-1",
      items: [{ modongId: "modong-1" }, { modongId: "modong-2" }]
    });
    prisma.share.findFirst.mockResolvedValue(null);
    prisma.share.create.mockResolvedValue({});

    await service.createModongGroupShare("owner-1", "group-1", [
      "modong-2",
      "modong-1"
    ]);

    expect(prisma.share.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ownerId: "owner-1",
        kind: "MODONG_GROUP",
        modongGroupId: "group-1",
        featuredItems: {
          create: [
            { modongId: "modong-2", position: 0 },
            { modongId: "modong-1", position: 1 }
          ]
        }
      })
    });
  });

  it("rejects featured Modong outside the selected group", async () => {
    const prisma = createPrismaMock();
    const service = new ShareService(prisma as never);

    prisma.modongGroup.findFirst.mockResolvedValue({
      id: "group-1",
      items: [{ modongId: "modong-1" }]
    });

    await expect(
      service.createModongGroupShare("owner-1", "group-1", ["modong-2"])
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.share.create).not.toHaveBeenCalled();
  });

  it("throws NotFoundException for unknown or revoked token", async () => {
    const prisma = createPrismaMock();
    const service = new ShareService(prisma as never);
    prisma.share.findFirst.mockResolvedValue(null);

    await expect(service.getPublicShare("bad-token")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("returns MODONG payload for a valid Modong share", async () => {
    const prisma = createPrismaMock();
    const service = new ShareService(prisma as never);
    const token = "test-token-1234";

    prisma.share.findFirst.mockResolvedValue({
      id: "share-1",
      kind: "MODONG",
      modongId: "modong-1",
      modongGroupId: null,
      wantedItemId: null
    });
    prisma.modong.findUnique.mockResolvedValue({
      id: "modong-1",
      name: "MG Sazabi",
      state: PrismaModongState.MODONG,
      releaseYear: 2008,
      acquisitionYear: 2024,
      collectibleKind: { name: "Gunpla" },
      photos: [],
      owner: { displayName: "นาย Collector" }
    });

    const result = await service.getPublicShare(token);

    expect(result.kind).toBe("MODONG");
    expect((result as { kind: "MODONG"; modong: { name: string } }).modong.name).toBe("MG Sazabi");
  });

  it("returns WANTED payload for a Needle Hunting item", async () => {
    const prisma = createPrismaMock();
    const service = new ShareService(prisma as never);

    prisma.share.findFirst.mockResolvedValue({
      id: "share-1",
      kind: "WANTED",
      modongId: null,
      modongGroupId: null,
      wantedItemId: "wanted-1"
    });
    prisma.wantedItem.findUnique.mockResolvedValue({
      id: "wanted-1",
      name: "HG Nightingale",
      state: PrismaWantedState.NEEDLE_HUNTING,
      photos: [],
      owner: { displayName: "นาย Hunter" }
    });

    const result = await service.getPublicShare("token-abc");

    expect(result.kind).toBe("WANTED");
    const payload = result as { kind: "WANTED"; wanted: { phrase: string } };
    expect(payload.wanted.phrase).toBe("อยากรับมาเลี้ยงดู");
  });

  it("uses selected featured photos for group share payload", async () => {
    const prisma = createPrismaMock();
    const service = new ShareService(prisma as never);

    prisma.share.findFirst.mockResolvedValue({
      id: "share-1",
      kind: "MODONG_GROUP",
      modongId: null,
      modongGroupId: "group-1",
      wantedItemId: null
    });
    prisma.modongGroup.findUnique.mockResolvedValue({
      id: "group-1",
      name: "กองสุลต่าน",
      owner: { displayName: "นาย Collector" },
      items: [
        {
          modong: {
            id: "modong-1",
            name: "MG Sazabi",
            state: PrismaModongState.MODONG,
            releaseYear: 2008,
            acquisitionYear: 2024,
            collectibleKind: { name: "Gunpla" },
            photos: [{ storageKey: "fallback.jpg" }]
          }
        }
      ]
    });
    prisma.share.findUnique.mockResolvedValue({
      featuredItems: [
        {
          modong: {
            photos: [{ storageKey: "selected.jpg" }]
          }
        }
      ]
    });

    const result = await service.getPublicShare("group-token");

    expect(result.kind).toBe("MODONG_GROUP");
    expect(
      (result as { kind: "MODONG_GROUP"; group: { featuredPhotos: string[] } })
        .group.featuredPhotos
    ).toEqual(["/uploads/selected.jpg"]);
  });

  it("falls back to group member photos when no featured photos were selected", async () => {
    const prisma = createPrismaMock();
    const service = new ShareService(prisma as never);

    prisma.share.findFirst.mockResolvedValue({
      id: "share-1",
      kind: "MODONG_GROUP",
      modongId: null,
      modongGroupId: "group-1",
      wantedItemId: null
    });
    prisma.modongGroup.findUnique.mockResolvedValue({
      id: "group-1",
      name: "กองสุลต่าน",
      owner: { displayName: "นาย Collector" },
      items: [
        {
          modong: {
            id: "modong-1",
            name: "MG Sazabi",
            state: PrismaModongState.MODONG,
            releaseYear: 2008,
            acquisitionYear: 2024,
            collectibleKind: { name: "Gunpla" },
            photos: [{ storageKey: "fallback.jpg" }]
          }
        }
      ]
    });
    prisma.share.findUnique.mockResolvedValue({ featuredItems: [] });

    const result = await service.getPublicShare("group-token");

    expect(
      (result as { kind: "MODONG_GROUP"; group: { featuredPhotos: string[] } })
        .group.featuredPhotos
    ).toEqual(["/uploads/fallback.jpg"]);
  });

  it("throws ForbiddenException for non-Needle-Hunting Wanted share", async () => {
    const prisma = createPrismaMock();
    const service = new ShareService(prisma as never);

    prisma.share.findFirst.mockResolvedValue({
      id: "share-1",
      kind: "WANTED",
      modongId: null,
      modongGroupId: null,
      wantedItemId: "wanted-1"
    });
    prisma.wantedItem.findUnique.mockResolvedValue({
      id: "wanted-1",
      name: "Already found",
      state: PrismaWantedState.MISSION_COMPLETE,
      photos: [],
      owner: { displayName: "Owner" }
    });

    await expect(service.getPublicShare("token-xyz")).rejects.toBeInstanceOf(
      ForbiddenException
    );
  });

  it("revokes a share owned by the requesting owner", async () => {
    const prisma = createPrismaMock();
    const service = new ShareService(prisma as never);
    const token = "revoke-me";

    prisma.share.findFirst.mockResolvedValue({ id: "share-99" });
    prisma.share.update.mockResolvedValue({});

    const result = await service.revokeShare("owner-1", token);

    expect(prisma.share.update).toHaveBeenCalledWith({
      where: { id: "share-99" },
      data: { revokedAt: expect.any(Date) }
    });
    expect(result).toEqual({ ok: true });
  });
});
