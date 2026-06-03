import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { mapModongStateToDomain } from "../modong/modong-state.mapper";

// Gallery-eligible states: โมดอง, ต่อไม่เสร็จ, ต่อแล้ว
const GALLERY_STATES = ["MODONG", "UNFINISHED", "COMPLETED"] as const;

@Injectable()
export class GalleryService {
  constructor(private readonly prisma: PrismaService) {}

  async getOwnerGallery(handle: string) {
    const owner = await this.prisma.owner.findUnique({
      where: { handle },
      select: { id: true, displayName: true, handle: true }
    });

    if (!owner) throw new NotFoundException("Owner not found");

    const items = await this.prisma.modong.findMany({
      where: {
        ownerId: owner.id,
        galleryVisible: true,
        state: { in: [...GALLERY_STATES] }
      },
      orderBy: { createdAt: "desc" },
      include: {
        collectibleKind: { select: { name: true } },
        photos: {
          where: { kind: "MODONG_MAIN" },
          select: { storageKey: true },
          take: 1
        }
      }
    });

    return {
      owner: {
        displayName: owner.displayName,
        handle: owner.handle
      },
      items: items.map((m) => ({
        id: m.id,
        name: m.name,
        state: mapModongStateToDomain(m.state),
        collectibleKind: m.collectibleKind?.name ?? null,
        releaseYear: m.releaseYear,
        acquisitionYear: m.acquisitionYear,
        mainPhotoUrl: m.photos[0] ? `/uploads/${m.photos[0].storageKey}` : null
      }))
    };
  }
}
