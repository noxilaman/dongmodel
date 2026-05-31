import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listKinds() {
    const kinds = await this.prisma.collectibleKind.findMany({
      orderBy: { name: "asc" }
    });
    return kinds.map(toKindDto);
  }

  async createKind(name: string) {
    const existing = await this.prisma.collectibleKind.findUnique({
      where: { name }
    });
    if (existing) {
      throw new ConflictException(`Collectible Kind "${name}" already exists`);
    }
    const kind = await this.prisma.collectibleKind.create({
      data: { name }
    });
    return toKindDto(kind);
  }

  async updateKind(id: string, name?: string, isActive?: boolean) {
    const existing = await this.prisma.collectibleKind.findUnique({
      where: { id }
    });
    if (!existing) {
      throw new NotFoundException("Collectible Kind not found");
    }
    const kind = await this.prisma.collectibleKind.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(isActive !== undefined ? { isActive } : {})
      }
    });
    return toKindDto(kind);
  }

  async deleteKind(id: string) {
    const existing = await this.prisma.collectibleKind.findUnique({
      where: { id }
    });
    if (!existing) {
      throw new NotFoundException("Collectible Kind not found");
    }
    await this.prisma.collectibleKind.delete({ where: { id } });
    return { ok: true };
  }
}

type KindRecord = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toKindDto(kind: KindRecord) {
  return {
    id: kind.id,
    name: kind.name,
    isActive: kind.isActive,
    createdAt: kind.createdAt.toISOString(),
    updatedAt: kind.updatedAt.toISOString()
  };
}
