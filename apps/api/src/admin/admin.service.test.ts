import { ConflictException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminService } from "./admin.service";

const now = new Date("2026-05-31T00:00:00.000Z");

const prismaKind = {
  id: "kind-1",
  name: "Gunpla",
  isActive: true,
  createdAt: now,
  updatedAt: now
};

function createPrismaMock() {
  return {
    collectibleKind: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  };
}

describe("AdminService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("lists all collectible kinds ordered by name", async () => {
    const prisma = createPrismaMock();
    const service = new AdminService(prisma as never);
    prisma.collectibleKind.findMany.mockResolvedValue([prismaKind]);

    const result = await service.listKinds();

    expect(prisma.collectibleKind.findMany).toHaveBeenCalledWith({
      orderBy: { name: "asc" }
    });
    expect(result[0]).toEqual({
      id: "kind-1",
      name: "Gunpla",
      isActive: true,
      createdAt: "2026-05-31T00:00:00.000Z",
      updatedAt: "2026-05-31T00:00:00.000Z"
    });
  });

  it("creates a new collectible kind", async () => {
    const prisma = createPrismaMock();
    const service = new AdminService(prisma as never);
    prisma.collectibleKind.findUnique.mockResolvedValue(null);
    prisma.collectibleKind.create.mockResolvedValue(prismaKind);

    const result = await service.createKind("Gunpla");

    expect(prisma.collectibleKind.create).toHaveBeenCalledWith({
      data: { name: "Gunpla" }
    });
    expect(result.name).toBe("Gunpla");
  });

  it("throws ConflictException when creating a duplicate kind name", async () => {
    const prisma = createPrismaMock();
    const service = new AdminService(prisma as never);
    prisma.collectibleKind.findUnique.mockResolvedValue(prismaKind);

    await expect(service.createKind("Gunpla")).rejects.toBeInstanceOf(
      ConflictException
    );
    expect(prisma.collectibleKind.create).not.toHaveBeenCalled();
  });

  it("updates a collectible kind name and isActive", async () => {
    const prisma = createPrismaMock();
    const service = new AdminService(prisma as never);
    prisma.collectibleKind.findUnique.mockResolvedValue(prismaKind);
    prisma.collectibleKind.update.mockResolvedValue({
      ...prismaKind,
      name: "HG Gunpla",
      isActive: false
    });

    const result = await service.updateKind("kind-1", "HG Gunpla", false);

    expect(prisma.collectibleKind.update).toHaveBeenCalledWith({
      where: { id: "kind-1" },
      data: { name: "HG Gunpla", isActive: false }
    });
    expect(result.name).toBe("HG Gunpla");
    expect(result.isActive).toBe(false);
  });

  it("throws NotFoundException when updating a non-existent kind", async () => {
    const prisma = createPrismaMock();
    const service = new AdminService(prisma as never);
    prisma.collectibleKind.findUnique.mockResolvedValue(null);

    await expect(service.updateKind("bad-id", "X")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("deletes a collectible kind", async () => {
    const prisma = createPrismaMock();
    const service = new AdminService(prisma as never);
    prisma.collectibleKind.findUnique.mockResolvedValue(prismaKind);
    prisma.collectibleKind.delete.mockResolvedValue(prismaKind);

    const result = await service.deleteKind("kind-1");

    expect(prisma.collectibleKind.delete).toHaveBeenCalledWith({
      where: { id: "kind-1" }
    });
    expect(result).toEqual({ ok: true });
  });

  it("throws NotFoundException when deleting a non-existent kind", async () => {
    const prisma = createPrismaMock();
    const service = new AdminService(prisma as never);
    prisma.collectibleKind.findUnique.mockResolvedValue(null);

    await expect(service.deleteKind("bad-id")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });
});
