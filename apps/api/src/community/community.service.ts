import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { mapModongStateToDomain } from "../modong/modong-state.mapper";

const GALLERY_STATES = ["MODONG", "UNFINISHED", "COMPLETED"] as const;

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(kindId?: string) {
    const items = await this.prisma.modong.findMany({
      where: {
        galleryVisible: true,
        state: { in: [...GALLERY_STATES] },
        ...(kindId ? { collectibleKindId: kindId } : {})
      },
      orderBy: { updatedAt: "desc" },
      take: 48,
      include: {
        owner: { select: { handle: true, displayName: true } },
        collectibleKind: { select: { id: true, name: true } },
        photos: {
          where: { kind: "MODONG_MAIN" },
          select: { storageKey: true },
          take: 1
        }
      }
    });

    return {
      items: items.map((m) => ({
        id: m.id,
        name: m.name,
        state: mapModongStateToDomain(m.state),
        collectibleKind: m.collectibleKind
          ? { id: m.collectibleKind.id, name: m.collectibleKind.name }
          : null,
        mainPhotoUrl: m.photos[0] ? `/uploads/${m.photos[0].storageKey}` : null,
        ownerHandle: m.owner.handle,
        ownerDisplayName: m.owner.displayName
      }))
    };
  }
}
