import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { GalleryController } from "./gallery.controller";
import { GalleryService } from "./gallery.service";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [GalleryController],
  providers: [GalleryService]
})
export class GalleryModule {}
