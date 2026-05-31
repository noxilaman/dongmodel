import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { LocalImageStorage } from "./storage/local-image.storage";
import { PhotoController } from "./photo.controller";
import { PhotoService } from "./photo.service";

@Module({
  imports: [AuthModule],
  controllers: [PhotoController],
  providers: [PhotoService, LocalImageStorage]
})
export class PhotoModule {}
