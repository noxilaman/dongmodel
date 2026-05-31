import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateModongInput,
  ListModongQuery,
  UpdateModongInput
} from "@dongmodel/shared";
import { PrismaService } from "../prisma/prisma.service";
import {
  mapModongStateToDomain,
  mapModongStateToPrisma
} from "./modong-state.mapper";

@Injectable()
export class ModongService {
  constructor(private readonly prisma: PrismaService) {}

  async list(ownerId: string, query: ListModongQuery) {
    const items = await this.prisma.modong.findMany({
      where: {
        ownerId,
        ...(query.q
          ? {
              name: {
                contains: query.q
              }
            }
          : {}),
        ...(query.state ? { state: mapModongStateToPrisma(query.state) } : {}),
        ...(query.collectibleKindId
          ? { collectibleKindId: query.collectibleKindId }
          : {}),
        ...(query.releaseYear ? { releaseYear: query.releaseYear } : {}),
        ...(query.acquisitionYear
          ? { acquisitionYear: query.acquisitionYear }
          : {})
      },
      orderBy: { createdAt: "desc" },
      include: { collectibleKind: true }
    });

    return items.map(toModongDto);
  }

  async get(ownerId: string, id: string) {
    const modong = await this.prisma.modong.findFirst({
      where: { id, ownerId },
      include: { collectibleKind: true }
    });

    if (!modong) {
      throw new NotFoundException("Modong not found");
    }

    return toModongDto(modong);
  }

  async create(ownerId: string, input: CreateModongInput) {
    const modong = await this.prisma.modong.create({
      data: {
        ownerId,
        ...toModongCreateData(input)
      },
      include: { collectibleKind: true }
    });

    return toModongDto(modong);
  }

  async update(ownerId: string, id: string, input: UpdateModongInput) {
    await this.assertOwned(ownerId, id);

    const modong = await this.prisma.modong.update({
      where: { id },
      data: toModongUpdateData(input),
      include: { collectibleKind: true }
    });

    return toModongDto(modong);
  }

  async delete(ownerId: string, id: string) {
    await this.assertOwned(ownerId, id);
    await this.prisma.modong.delete({ where: { id } });
    return { ok: true };
  }

  private async assertOwned(ownerId: string, id: string) {
    const existing = await this.prisma.modong.findFirst({
      where: { id, ownerId },
      select: { id: true }
    });

    if (!existing) {
      throw new NotFoundException("Modong not found");
    }
  }
}

function toModongCreateData(input: CreateModongInput) {
  return {
    name: input.name,
    state: mapModongStateToPrisma(input.state),
    collectibleKindId: input.collectibleKindId,
    releaseYear: input.releaseYear,
    acquisitionYear: input.acquisitionYear,
    releasedAwayYear: input.releasedAwayYear,
    acquisitionSource: input.acquisitionSource,
    storageNote: input.storageNote,
    privateNote: input.privateNote,
    purchaseAmount: input.purchaseAmount,
    purchaseCurrency: input.purchaseCurrency,
    releaseAmount: input.releaseAmount,
    releaseCurrency: input.releaseCurrency,
    galleryVisible: input.galleryVisible
  };
}

function toModongUpdateData(input: UpdateModongInput) {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.state !== undefined
      ? { state: mapModongStateToPrisma(input.state) }
      : {}),
    ...(input.collectibleKindId !== undefined
      ? { collectibleKindId: input.collectibleKindId }
      : {}),
    ...(input.releaseYear !== undefined ? { releaseYear: input.releaseYear } : {}),
    ...(input.acquisitionYear !== undefined
      ? { acquisitionYear: input.acquisitionYear }
      : {}),
    ...(input.releasedAwayYear !== undefined
      ? { releasedAwayYear: input.releasedAwayYear }
      : {}),
    ...(input.acquisitionSource !== undefined
      ? { acquisitionSource: input.acquisitionSource }
      : {}),
    ...(input.storageNote !== undefined ? { storageNote: input.storageNote } : {}),
    ...(input.privateNote !== undefined ? { privateNote: input.privateNote } : {}),
    ...(input.purchaseAmount !== undefined
      ? { purchaseAmount: input.purchaseAmount }
      : {}),
    ...(input.purchaseCurrency !== undefined
      ? { purchaseCurrency: input.purchaseCurrency }
      : {}),
    ...(input.releaseAmount !== undefined ? { releaseAmount: input.releaseAmount } : {}),
    ...(input.releaseCurrency !== undefined
      ? { releaseCurrency: input.releaseCurrency }
      : {}),
    ...(input.galleryVisible !== undefined
      ? { galleryVisible: input.galleryVisible }
      : {})
  };
}

type ModongWithKind = {
  id: string;
  ownerId: string;
  collectibleKindId: string | null;
  name: string;
  state: Parameters<typeof mapModongStateToDomain>[0];
  releaseYear: number | null;
  acquisitionYear: number | null;
  releasedAwayYear: number | null;
  acquisitionSource: string | null;
  storageNote: string | null;
  privateNote: string | null;
  purchaseAmount: unknown;
  purchaseCurrency: string;
  releaseAmount: unknown;
  releaseCurrency: string;
  galleryVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
  collectibleKind: { id: string; name: string } | null;
};

function toModongDto(modong: ModongWithKind) {
  return {
    id: modong.id,
    ownerId: modong.ownerId,
    name: modong.name,
    state: mapModongStateToDomain(modong.state),
    collectibleKind: modong.collectibleKind
      ? {
          id: modong.collectibleKind.id,
          name: modong.collectibleKind.name
        }
      : null,
    releaseYear: modong.releaseYear,
    acquisitionYear: modong.acquisitionYear,
    releasedAwayYear: modong.releasedAwayYear,
    acquisitionSource: modong.acquisitionSource,
    storageNote: modong.storageNote,
    privateNote: modong.privateNote,
    purchaseAmount: modong.purchaseAmount?.toString() ?? null,
    purchaseCurrency: modong.purchaseCurrency,
    releaseAmount: modong.releaseAmount?.toString() ?? null,
    releaseCurrency: modong.releaseCurrency,
    galleryVisible: modong.galleryVisible,
    createdAt: modong.createdAt.toISOString(),
    updatedAt: modong.updatedAt.toISOString()
  };
}
