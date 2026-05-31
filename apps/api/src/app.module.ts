import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { GalleryModule } from "./gallery/gallery.module";
import { ModongModule } from "./modong/modong.module";
import { OrganizeModule } from "./organize/organize.module";
import { PhotoModule } from "./photo/photo.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ShareModule } from "./share/share.module";
import { SummaryModule } from "./summary/summary.module";
import { WantedModule } from "./wanted/wanted.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ModongModule,
    WantedModule,
    OrganizeModule,
    PhotoModule,
    ShareModule,
    GalleryModule,
    AdminModule,
    SummaryModule
  ]
})
export class AppModule {}
