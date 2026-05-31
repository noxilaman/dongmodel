import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateWantedListInput,
  UpdateWantedListInput
} from "@dongmodel/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class WantedListsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(ownerId: string) {
    const lists = await this.prisma.wantedList.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } }
    });

    return lists.map(toWantedListDto);
  }

  async get(ownerId: string, id: string) {
    const list = await this.prisma.wantedList.findFirst({
      where: { id, ownerId },
      include: {
        _count: { select: { items: true } },
        items: {
          select: {
            id: true,
            name: true,
            state: true
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!list) {
      throw new NotFoundException("Wanted List not found");
    }

    return {
      ...toWantedListDto(list),
      items: list.items
    };
  }

  async create(ownerId: string, input: CreateWantedListInput) {
    const list = await this.prisma.wantedList.create({
      data: {
        ownerId,
        name: input.name
      },
      include: { _count: { select: { items: true } } }
    });

    return toWantedListDto(list);
  }

  async update(ownerId: string, id: string, input: UpdateWantedListInput) {
    await this.assertOwned(ownerId, id);

    const list = await this.prisma.wantedList.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {})
      },
      include: { _count: { select: { items: true } } }
    });

    return toWantedListDto(list);
  }

  async delete(ownerId: string, id: string) {
    await this.assertOwned(ownerId, id);
    await this.prisma.wantedList.delete({ where: { id } });
    return { ok: true };
  }

  private async assertOwned(ownerId: string, id: string) {
    const list = await this.prisma.wantedList.findFirst({
      where: { id, ownerId },
      select: { id: true }
    });

    if (!list) {
      throw new NotFoundException("Wanted List not found");
    }
  }
}

type WantedListRecord = {
  id: string;
  ownerId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { items: number };
};

function toWantedListDto(list: WantedListRecord) {
  return {
    id: list.id,
    ownerId: list.ownerId,
    name: list.name,
    itemCount: list._count.items,
    createdAt: list.createdAt.toISOString(),
    updatedAt: list.updatedAt.toISOString()
  };
}
