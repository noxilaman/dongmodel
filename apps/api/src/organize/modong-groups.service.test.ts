import { NotFoundException } from "@nestjs/common";
import { ModongState } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModongGroupsService } from "./modong-groups.service";

const now = new Date("2026-05-31T00:00:00.000Z");

const groupRecord = {
  id: "group-1",
  ownerId: "owner-1",
  name: "กองสุลต่าน",
  note: "เอาไว้อวด",
  createdAt: now,
  updatedAt: now,
  _count: { items: 2 }
};

function createPrismaMock() {
  return {
    modongGroup: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    modong: {
      findFirst: vi.fn()
    },
    modongGroupItem: {
      upsert: vi.fn(),
      deleteMany: vi.fn()
    }
  };
}

function createService() {
  const prisma = createPrismaMock();
  return {
    prisma,
    service: new ModongGroupsService(prisma as never)
  };
}

describe("ModongGroupsService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("lists owner-scoped groups with item count", async () => {
    const { prisma, service } = createService();
    prisma.modongGroup.findMany.mockResolvedValue([groupRecord]);

    const result = await service.list("owner-1");

    expect(prisma.modongGroup.findMany).toHaveBeenCalledWith({
      where: { ownerId: "owner-1" },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } }
    });
    expect(result[0]).toEqual({
      id: "group-1",
      ownerId: "owner-1",
      name: "กองสุลต่าน",
      note: "เอาไว้อวด",
      itemCount: 2,
      createdAt: "2026-05-31T00:00:00.000Z",
      updatedAt: "2026-05-31T00:00:00.000Z"
    });
  });

  it("creates a group for the current owner", async () => {
    const { prisma, service } = createService();
    prisma.modongGroup.create.mockResolvedValue(groupRecord);

    await service.create("owner-1", {
      name: "กองสุลต่าน",
      note: "เอาไว้อวด"
    });

    expect(prisma.modongGroup.create).toHaveBeenCalledWith({
      data: {
        ownerId: "owner-1",
        name: "กองสุลต่าน",
        note: "เอาไว้อวด"
      },
      include: { _count: { select: { items: true } } }
    });
  });

  it("adds an owned Modong to an owned group idempotently", async () => {
    const { prisma, service } = createService();
    prisma.modongGroup.findFirst.mockResolvedValue({ id: "group-1" });
    prisma.modong.findFirst.mockResolvedValue({ id: "modong-1" });
    prisma.modongGroupItem.upsert.mockResolvedValue({
      groupId: "group-1",
      modongId: "modong-1",
      addedAt: now
    });

    const result = await service.addModong("owner-1", "group-1", "modong-1");

    expect(prisma.modongGroupItem.upsert).toHaveBeenCalledWith({
      where: {
        modongId_groupId: {
          modongId: "modong-1",
          groupId: "group-1"
        }
      },
      update: {},
      create: {
        modongId: "modong-1",
        groupId: "group-1"
      }
    });
    expect(result).toEqual({
      groupId: "group-1",
      modongId: "modong-1",
      addedAt: "2026-05-31T00:00:00.000Z"
    });
  });

  it("rejects adding another owner's Modong", async () => {
    const { prisma, service } = createService();
    prisma.modongGroup.findFirst.mockResolvedValue({ id: "group-1" });
    prisma.modong.findFirst.mockResolvedValue(null);

    await expect(
      service.addModong("owner-1", "group-1", "modong-1")
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.modongGroupItem.upsert).not.toHaveBeenCalled();
  });

  it("returns group details with member Modong", async () => {
    const { prisma, service } = createService();
    prisma.modongGroup.findFirst.mockResolvedValue({
      ...groupRecord,
      items: [
        {
          modongId: "modong-1",
          addedAt: now,
          modong: {
            id: "modong-1",
            name: "MG Sazabi",
            state: ModongState.MODONG
          }
        }
      ]
    });

    const result = await service.get("owner-1", "group-1");

    expect(result.items).toEqual([
      {
        modongId: "modong-1",
        addedAt: "2026-05-31T00:00:00.000Z",
        modong: {
          id: "modong-1",
          name: "MG Sazabi",
          state: ModongState.MODONG
        }
      }
    ]);
  });

  it("removes a Modong membership", async () => {
    const { prisma, service } = createService();
    prisma.modongGroup.findFirst.mockResolvedValue({ id: "group-1" });
    prisma.modong.findFirst.mockResolvedValue({ id: "modong-1" });
    prisma.modongGroupItem.deleteMany.mockResolvedValue({ count: 1 });

    await expect(
      service.removeModong("owner-1", "group-1", "modong-1")
    ).resolves.toEqual({ ok: true });
  });
});
