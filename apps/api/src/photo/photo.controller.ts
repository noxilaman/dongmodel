import {
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "../auth/auth.guard";
import type { AuthenticatedOwner } from "../auth/authenticated-owner";
import { CurrentOwner } from "../auth/current-owner.decorator";
import { PhotoService } from "./photo.service";

@UseGuards(AuthGuard)
@Controller()
export class PhotoController {
  constructor(private readonly photos: PhotoService) {}

  @Post("modong/:id/photos/main")
  @UseInterceptors(FileInterceptor("file"))
  async uploadMainPhoto(
    @CurrentOwner() owner: AuthenticatedOwner,
    @Param("id") id: string,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return {
      photo: await this.photos.uploadMainPhoto(owner.id, id, file)
    };
  }

  @Post("modong/:id/photos/additional")
  @UseInterceptors(FileInterceptor("file"))
  async uploadAdditionalPhoto(
    @CurrentOwner() owner: AuthenticatedOwner,
    @Param("id") id: string,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return {
      photo: await this.photos.uploadAdditionalPhoto(owner.id, id, file)
    };
  }

  @Post("wanted/:id/photos/reference")
  @UseInterceptors(FileInterceptor("file"))
  async uploadWantedReferencePhoto(
    @CurrentOwner() owner: AuthenticatedOwner,
    @Param("id") id: string,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return {
      photo: await this.photos.uploadWantedReferencePhoto(owner.id, id, file)
    };
  }

  @Delete("photos/:id")
  async delete(@CurrentOwner() owner: AuthenticatedOwner, @Param("id") id: string) {
    return this.photos.delete(owner.id, id);
  }
}
