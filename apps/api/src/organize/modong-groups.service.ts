import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateModongGroupInput,
  UpdateModongGroupInput
} from "@dongmodel/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ModongGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(ownerId: string) {
    const groups = await this.prisma.modongGroup.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } }
    });

    return groups.map(toGroupDto);
  }

  async get(ownerId: string, id: string) {
    const group = await this.prisma.modongGroup.findFirst({
      where: { id, ownerId },
      include: {
        _count: { select: { items: true } },
        items: {
          include: {
            modong: {
              select: {
                id: true,
                name: true,
                state: true
              }
            }
          },
          orderBy: { addedAt: "desc" }
        }
      }
    });

    if (!group) {
      throw new NotFoundException("Modong Group not found");
    }

    return {
      ...toGroupDto(group),
      items: group.items.map((item) => ({
        modongId: item.modongId,
        addedAt: item.addedAt.toISOString(),
        modong: item.modong
      }))
    };
  }

  async create(ownerId: string, input: CreateModongGroupInput) {
    const group = await this.prisma.modongGroup.create({
      data: {
        ownerId,
        name: input.name,
        note: input.note
      },
      include: { _count: { select: { items: true } } }
    });

    return toGroupDto(group);
  }

  async update(ownerId: string, id: string, input: UpdateModongGroupInput) {
    await this.assertOwnedGroup(ownerId, id);

    const group = await this.prisma.modongGroup.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.note !== undefined ? { note: input.note } : {})
      },
      include: { _count: { select: { items: true } } }
    });

    return toGroupDto(group);
  }

  async delete(ownerId: string, id: string) {
    await this.assertOwnedGroup(ownerId, id);
    await this.prisma.modongGroup.delete({ where: { id } });
    return { ok: true };
  }

  async addModong(ownerId: string, groupId: string, modongId: string) {
    await this.assertOwnedGroup(ownerId, groupId);
    await this.assertOwnedModong(ownerId, modongId);

    const link = await this.prisma.modongGroupItem.upsert({
      where: {
        modongId_groupId: {
          modongId,
          groupId
        }
      },
      update: {},
      create: {
        modongId,
        groupId
      }
    });

    return {
      modongId: link.modongId,
      groupId: link.groupId,
      addedAt: link.addedAt.toISOString()
    };
  }

  async removeModong(ownerId: string, groupId: string, modongId: string) {
    await this.assertOwnedGroup(ownerId, groupId);
    await this.assertOwnedModong(ownerId, modongId);

    await this.prisma.modongGroupItem.deleteMany({
      where: {
        groupId,
        modongId
      }
    });

    return { ok: true };
  }

  private async assertOwnedGroup(ownerId: string, id: string) {
    const group = await this.prisma.modongGroup.findFirst({
      where: { id, ownerId },
      select: { id: true }
    });

    if (!group) {
      throw new NotFoundException("Modong Group not found");
    }
  }

  private async assertOwnedModong(ownerId: string, id: string) {
    const modong = await this.prisma.modong.findFirst({
      where: { id, ownerId },
      select: { id: true }
    });

    if (!modong) {
      throw new NotFoundException("Modong not found");
    }
  }
}

type GroupRecord = {
  id: string;
  ownerId: string;
  name: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { items: number };
};

function toGroupDto(group: GroupRecord) {
  return {
    id: group.id,
    ownerId: group.ownerId,
    name: group.name,
    note: group.note,
    itemCount: group._count.items,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString()
  };
}
