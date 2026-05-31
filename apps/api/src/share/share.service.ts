import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { mapModongStateToDomain } from "../modong/modong-state.mapper";
import { mapWantedStateToDomain } from "../wanted/wanted-state.mapper";

@Injectable()
export class ShareService {
  constructor(private readonly prisma: PrismaService) {}

  // --- owner actions ---

  async createModongShare(ownerId: string, modongId: string) {
    await this.assertOwnedModong(ownerId, modongId);
    return this.upsertShare(ownerId, { kind: "MODONG", modongId });
  }

  async createModongGroupShare(ownerId: string, modongGroupId: string) {
    await this.assertOwnedGroup(ownerId, modongGroupId);
    return this.upsertShare(ownerId, { kind: "MODONG_GROUP", modongGroupId });
  }

  async createWantedShare(ownerId: string, wantedItemId: string) {
    await this.assertOwnedWanted(ownerId, wantedItemId);
    return this.upsertShare(ownerId, { kind: "WANTED", wantedItemId });
  }

  async revokeShare(ownerId: string, token: string) {
    const share = await this.prisma.share.findFirst({
      where: { tokenHash: hashToken(token), ownerId }
    });
    if (!share) throw new NotFoundException("Share not found");

    await this.prisma.share.update({
      where: { id: share.id },
      data: { revokedAt: new Date() }
    });
    return { ok: true };
  }

  async listOwnerShares(ownerId: string) {
    const shares = await this.prisma.share.findMany({
      where: { ownerId, revokedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        kind: true,
        modongId: true,
        modongGroupId: true,
        wantedItemId: true,
        createdAt: true
      }
    });
    // Return plain token only on creation — here we only return metadata without the token
    return shares.map((s) => ({
      id: s.id,
      kind: s.kind,
      modongId: s.modongId,
      modongGroupId: s.modongGroupId,
      wantedItemId: s.wantedItemId,
      createdAt: s.createdAt.toISOString()
    }));
  }

  // --- public view ---

  async getPublicShare(token: string) {
    const share = await this.prisma.share.findFirst({
      where: { tokenHash: hashToken(token), revokedAt: null }
    });
    if (!share) throw new NotFoundException("Share not found or revoked");

    switch (share.kind) {
      case "MODONG":
        return this.buildModongPayload(share.modongId!);
      case "MODONG_GROUP":
        return this.buildGroupPayload(share.modongGroupId!);
      case "WANTED":
        return this.buildWantedPayload(share.wantedItemId!);
    }
  }

  // --- private helpers ---

  private async upsertShare(
    ownerId: string,
    target: { kind: "MODONG"; modongId: string } | { kind: "MODONG_GROUP"; modongGroupId: string } | { kind: "WANTED"; wantedItemId: string }
  ) {
    // Reuse existing non-revoked share for same target
    const where =
      target.kind === "MODONG"
        ? { ownerId, kind: "MODONG" as const, modongId: target.modongId, revokedAt: null }
        : target.kind === "MODONG_GROUP"
          ? { ownerId, kind: "MODONG_GROUP" as const, modongGroupId: target.modongGroupId, revokedAt: null }
          : { ownerId, kind: "WANTED" as const, wantedItemId: target.wantedItemId, revokedAt: null };

    const existing = await this.prisma.share.findFirst({ where });
    if (existing) {
      // Re-derive token is not possible (only hash stored) — create new
      await this.prisma.share.update({
        where: { id: existing.id },
        data: { revokedAt: new Date() }
      });
    }

    const token = randomUUID();
    await this.prisma.share.create({
      data: {
        ownerId,
        tokenHash: hashToken(token),
        kind: target.kind,
        ...(target.kind === "MODONG" ? { modongId: target.modongId } : {}),
        ...(target.kind === "MODONG_GROUP" ? { modongGroupId: target.modongGroupId } : {}),
        ...(target.kind === "WANTED" ? { wantedItemId: target.wantedItemId } : {})
      }
    });

    return { token };
  }

  private async buildModongPayload(modongId: string) {
    const modong = await this.prisma.modong.findUnique({
      where: { id: modongId },
      include: {
        collectibleKind: { select: { name: true } },
        photos: {
          where: { kind: "MODONG_MAIN" },
          select: { storageKey: true },
          take: 1
        },
        owner: { select: { displayName: true } }
      }
    });
    if (!modong) throw new NotFoundException("Modong not found");

    return {
      kind: "MODONG" as const,
      modong: {
        name: modong.name,
        state: mapModongStateToDomain(modong.state),
        releaseYear: modong.releaseYear,
        acquisitionYear: modong.acquisitionYear,
        collectibleKind: modong.collectibleKind?.name ?? null,
        mainPhotoUrl: modong.photos[0]
          ? `/uploads/${modong.photos[0].storageKey}`
          : null,
        ownerDisplayName: modong.owner.displayName
      }
    };
  }

  private async buildGroupPayload(modongGroupId: string) {
    const group = await this.prisma.modongGroup.findUnique({
      where: { id: modongGroupId },
      include: {
        owner: { select: { displayName: true } },
        items: {
          include: {
            modong: {
              include: {
                collectibleKind: { select: { name: true } },
                photos: {
                  where: { kind: "MODONG_MAIN" },
                  select: { storageKey: true },
                  take: 1
                }
              }
            }
          },
          orderBy: { addedAt: "desc" }
        }
      }
    });
    if (!group) throw new NotFoundException("Modong Group not found");

    const modongList = group.items.map((item) => ({
      id: item.modong.id,
      name: item.modong.name,
      state: mapModongStateToDomain(item.modong.state),
      releaseYear: item.modong.releaseYear,
      acquisitionYear: item.modong.acquisitionYear,
      collectibleKind: item.modong.collectibleKind?.name ?? null,
      mainPhotoUrl: item.modong.photos[0]
        ? `/uploads/${item.modong.photos[0].storageKey}`
        : null
    }));

    // Up to 5 featured photo URLs for the group card header
    const featuredPhotos = modongList
      .map((m) => m.mainPhotoUrl)
      .filter(Boolean)
      .slice(0, 5) as string[];

    return {
      kind: "MODONG_GROUP" as const,
      group: {
        name: group.name,
        ownerDisplayName: group.owner.displayName,
        totalCount: group.items.length,
        featuredPhotos,
        modong: modongList
      }
    };
  }

  private async buildWantedPayload(wantedItemId: string) {
    const item = await this.prisma.wantedItem.findUnique({
      where: { id: wantedItemId },
      include: {
        owner: { select: { displayName: true } },
        photos: {
          where: { kind: "WANTED_REFERENCE" },
          select: { storageKey: true },
          take: 1
        }
      }
    });
    if (!item) throw new NotFoundException("Wanted Item not found");

    const state = mapWantedStateToDomain(item.state);
    if (state !== "กำลังงมเข็ม") {
      throw new ForbiddenException("Wanted Share is only available for Needle Hunting items");
    }

    return {
      kind: "WANTED" as const,
      wanted: {
        name: item.name,
        state,
        referencePhotoUrl: item.photos[0]
          ? `/uploads/${item.photos[0].storageKey}`
          : null,
        ownerDisplayName: item.owner.displayName,
        phrase: "อยากรับมาเลี้ยงดู"
      }
    };
  }

  private async assertOwnedModong(ownerId: string, id: string) {
    const m = await this.prisma.modong.findFirst({
      where: { id, ownerId },
      select: { id: true }
    });
    if (!m) throw new NotFoundException("Modong not found");
  }

  private async assertOwnedGroup(ownerId: string, id: string) {
    const g = await this.prisma.modongGroup.findFirst({
      where: { id, ownerId },
      select: { id: true }
    });
    if (!g) throw new NotFoundException("Modong Group not found");
  }

  private async assertOwnedWanted(ownerId: string, id: string) {
    const w = await this.prisma.wantedItem.findFirst({
      where: { id, ownerId },
      select: { id: true }
    });
    if (!w) throw new NotFoundException("Wanted Item not found");
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
