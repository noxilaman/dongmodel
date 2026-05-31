import { Injectable, NotFoundException } from "@nestjs/common";
import {
  ModongState as PrismaModongState,
  WantedState as PrismaWantedState
} from "@prisma/client";
import type {
  CreateWantedItemInput,
  ListWantedItemsQuery,
  UpdateWantedItemInput
} from "@dongmodel/shared";
import { PrismaService } from "../prisma/prisma.service";
import {
  mapWantedStateToDomain,
  mapWantedStateToPrisma
} from "./wanted-state.mapper";

@Injectable()
export class WantedService {
  constructor(private readonly prisma: PrismaService) {}

  async list(ownerId: string, query: ListWantedItemsQuery) {
    const items = await this.prisma.wantedItem.findMany({
      where: {
        ownerId,
        ...(query.q ? { name: { contains: query.q } } : {}),
        ...(query.state ? { state: mapWantedStateToPrisma(query.state) } : {}),
        ...(query.collectibleKindId
          ? { collectibleKindId: query.collectibleKindId }
          : {}),
        ...(query.wantedListId ? { wantedListId: query.wantedListId } : {})
      },
      orderBy: { createdAt: "desc" },
      include: wantedIncludes
    });

    return items.map(toWantedDto);
  }

  async get(ownerId: string, id: string) {
    const item = await this.prisma.wantedItem.findFirst({
      where: { id, ownerId },
      include: wantedIncludes
    });

    if (!item) {
      throw new NotFoundException("Wanted Item not found");
    }

    return toWantedDto(item);
  }

  async create(ownerId: string, input: CreateWantedItemInput) {
    if (input.state === "mission complete") {
      return this.createMissionComplete(ownerId, input);
    }

    const item = await this.prisma.wantedItem.create({
      data: {
        ownerId,
        ...toWantedCreateData(input)
      },
      include: wantedIncludes
    });

    return toWantedDto(item);
  }

  async update(ownerId: string, id: string, input: UpdateWantedItemInput) {
    const existing = await this.findOwned(ownerId, id);
    const nextState =
      input.state !== undefined ? mapWantedStateToPrisma(input.state) : undefined;

    if (
      nextState === PrismaWantedState.MISSION_COMPLETE &&
      !existing.acquiredModongId
    ) {
      return this.completeMission(ownerId, id, input);
    }

    const item = await this.prisma.wantedItem.update({
      where: { id },
      data: toWantedUpdateData(input),
      include: wantedIncludes
    });

    return toWantedDto(item);
  }

  async delete(ownerId: string, id: string) {
    await this.findOwned(ownerId, id);
    await this.prisma.wantedItem.delete({ where: { id } });
    return { ok: true };
  }

  private async createMissionComplete(
    ownerId: string,
    input: CreateWantedItemInput
  ) {
    const item = await this.prisma.$transaction(async (tx) => {
      const modong = await tx.modong.create({
        data: {
          ownerId,
          name: input.name,
          state: PrismaModongState.MODONG,
          collectibleKindId: input.collectibleKindId,
          galleryVisible: true
        },
        select: { id: true }
      });

      return tx.wantedItem.create({
        data: {
          ownerId,
          ...toWantedCreateData(input),
          state: PrismaWantedState.MISSION_COMPLETE,
          acquiredModongId: modong.id
        },
        include: wantedIncludes
      });
    });

    return toWantedDto(item);
  }

  private async completeMission(
    ownerId: string,
    id: string,
    input: UpdateWantedItemInput
  ) {
    const item = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.wantedItem.findFirst({
        where: { id, ownerId },
        select: {
          id: true,
          name: true,
          collectibleKindId: true,
          acquiredModongId: true
        }
      });

      if (!existing) {
        throw new NotFoundException("Wanted Item not found");
      }

      const name = input.name ?? existing.name;
      const collectibleKindId =
        input.collectibleKindId ?? existing.collectibleKindId ?? undefined;

      const modong = await tx.modong.create({
        data: {
          ownerId,
          name,
          state: PrismaModongState.MODONG,
          collectibleKindId,
          galleryVisible: true
        },
        select: { id: true }
      });

      return tx.wantedItem.update({
        where: { id },
        data: {
          ...toWantedUpdateData(input),
          state: PrismaWantedState.MISSION_COMPLETE,
          acquiredModongId: modong.id
        },
        include: wantedIncludes
      });
    });

    return toWantedDto(item);
  }

  private async findOwned(ownerId: string, id: string) {
    const existing = await this.prisma.wantedItem.findFirst({
      where: { id, ownerId },
      select: {
        id: true,
        acquiredModongId: true
      }
    });

    if (!existing) {
      throw new NotFoundException("Wanted Item not found");
    }

    return existing;
  }
}

function toWantedCreateData(input: CreateWantedItemInput) {
  return {
    name: input.name,
    state: mapWantedStateToPrisma(input.state),
    collectibleKindId: input.collectibleKindId,
    wantedListId: input.wantedListId,
    wantedNote: input.wantedNote
  };
}

function toWantedUpdateData(input: UpdateWantedItemInput) {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.state !== undefined
      ? { state: mapWantedStateToPrisma(input.state) }
      : {}),
    ...(input.collectibleKindId !== undefined
      ? { collectibleKindId: input.collectibleKindId }
      : {}),
    ...(input.wantedListId !== undefined ? { wantedListId: input.wantedListId } : {}),
    ...(input.wantedNote !== undefined ? { wantedNote: input.wantedNote } : {})
  };
}

const wantedIncludes = {
  collectibleKind: true,
  wantedList: true,
  acquiredModong: {
    select: {
      id: true,
      name: true
    }
  }
} as const;

type WantedWithIncludes = {
  id: string;
  ownerId: string;
  collectibleKindId: string | null;
  wantedListId: string | null;
  acquiredModongId: string | null;
  name: string;
  state: Parameters<typeof mapWantedStateToDomain>[0];
  wantedNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  collectibleKind: { id: string; name: string } | null;
  wantedList: { id: string; name: string } | null;
  acquiredModong: { id: string; name: string } | null;
};

function toWantedDto(item: WantedWithIncludes) {
  return {
    id: item.id,
    ownerId: item.ownerId,
    name: item.name,
    state: mapWantedStateToDomain(item.state),
    collectibleKind: item.collectibleKind
      ? {
          id: item.collectibleKind.id,
          name: item.collectibleKind.name
        }
      : null,
    wantedList: item.wantedList
      ? {
          id: item.wantedList.id,
          name: item.wantedList.name
        }
      : null,
    acquiredModong: item.acquiredModong
      ? {
          id: item.acquiredModong.id,
          name: item.acquiredModong.name
        }
      : null,
    wantedNote: item.wantedNote,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}
