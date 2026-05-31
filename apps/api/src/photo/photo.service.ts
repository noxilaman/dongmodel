import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { PhotoKind } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { LocalImageStorage } from "./storage/local-image.storage";

@Injectable()
export class PhotoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: LocalImageStorage
  ) {}

  async uploadMainPhoto(
    ownerId: string,
    modongId: string,
    file: Express.Multer.File | undefined
  ) {
    this.assertImageFile(file);
    await this.assertOwnedModong(ownerId, modongId);

    const storageKey = await this.storage.save(ownerId, file);
    const existing = await this.prisma.photo.findFirst({
      where: { ownerId, modongId, kind: PhotoKind.MODONG_MAIN }
    });

    if (existing) {
      const photo = await this.prisma.photo.update({
        where: { id: existing.id },
        data: toPhotoData(ownerId, storageKey, file)
      });
      await this.storage.delete(existing.storageKey);
      return toPhotoDto(photo);
    }

    const photo = await this.prisma.photo.create({
      data: {
        ...toPhotoData(ownerId, storageKey, file),
        modongId,
        kind: PhotoKind.MODONG_MAIN
      }
    });

    return toPhotoDto(photo);
  }

  async uploadAdditionalPhoto(
    ownerId: string,
    modongId: string,
    file: Express.Multer.File | undefined
  ) {
    this.assertImageFile(file);
    await this.assertOwnedModong(ownerId, modongId);

    const count = await this.prisma.photo.count({
      where: { ownerId, modongId, kind: PhotoKind.MODONG_ADDITIONAL }
    });

    if (count >= 5) {
      throw new BadRequestException("A Modong can have up to five additional photos");
    }

    const storageKey = await this.storage.save(ownerId, file);
    const photo = await this.prisma.photo.create({
      data: {
        ...toPhotoData(ownerId, storageKey, file),
        modongId,
        kind: PhotoKind.MODONG_ADDITIONAL,
        sortOrder: count
      }
    });

    return toPhotoDto(photo);
  }

  async uploadWantedReferencePhoto(
    ownerId: string,
    wantedItemId: string,
    file: Express.Multer.File | undefined
  ) {
    this.assertImageFile(file);
    await this.assertOwnedWantedItem(ownerId, wantedItemId);

    const storageKey = await this.storage.save(ownerId, file);
    const existing = await this.prisma.photo.findFirst({
      where: { ownerId, wantedItemId, kind: PhotoKind.WANTED_REFERENCE }
    });

    if (existing) {
      const photo = await this.prisma.photo.update({
        where: { id: existing.id },
        data: toPhotoData(ownerId, storageKey, file)
      });
      await this.storage.delete(existing.storageKey);
      return toPhotoDto(photo);
    }

    const photo = await this.prisma.photo.create({
      data: {
        ...toPhotoData(ownerId, storageKey, file),
        wantedItemId,
        kind: PhotoKind.WANTED_REFERENCE
      }
    });

    return toPhotoDto(photo);
  }

  async delete(ownerId: string, photoId: string) {
    const existing = await this.prisma.photo.findFirst({
      where: { id: photoId, ownerId }
    });

    if (!existing) {
      throw new NotFoundException("Photo not found");
    }

    await this.prisma.photo.delete({ where: { id: photoId } });
    await this.storage.delete(existing.storageKey);
    return { ok: true };
  }

  private assertImageFile(file: Express.Multer.File | undefined): asserts file is Express.Multer.File {
    if (!file) {
      throw new BadRequestException("Image file is required");
    }

    if (!file.mimetype.startsWith("image/")) {
      throw new BadRequestException("Only image uploads are supported");
    }
  }

  private async assertOwnedModong(ownerId: string, modongId: string) {
    const modong = await this.prisma.modong.findFirst({
      where: { id: modongId, ownerId },
      select: { id: true }
    });

    if (!modong) {
      throw new NotFoundException("Modong not found");
    }
  }

  private async assertOwnedWantedItem(ownerId: string, wantedItemId: string) {
    const item = await this.prisma.wantedItem.findFirst({
      where: { id: wantedItemId, ownerId },
      select: { id: true }
    });

    if (!item) {
      throw new NotFoundException("Wanted Item not found");
    }
  }
}

function toPhotoData(
  ownerId: string,
  storageKey: string,
  file: Express.Multer.File
) {
  return {
    ownerId,
    storageKey,
    originalName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size
  };
}

type PhotoRecord = {
  id: string;
  ownerId: string;
  modongId: string | null;
  wantedItemId: string | null;
  kind: PhotoKind;
  storageKey: string;
  originalName: string | null;
  mimeType: string;
  sizeBytes: number;
  sortOrder: number;
  createdAt: Date;
};

function toPhotoDto(photo: PhotoRecord) {
  return {
    id: photo.id,
    ownerId: photo.ownerId,
    modongId: photo.modongId,
    wantedItemId: photo.wantedItemId,
    kind: photo.kind,
    storageKey: photo.storageKey,
    url: `/uploads/${photo.storageKey}`,
    originalName: photo.originalName,
    mimeType: photo.mimeType,
    sizeBytes: photo.sizeBytes,
    sortOrder: photo.sortOrder,
    createdAt: photo.createdAt.toISOString()
  };
}
