import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { GalleryService } from "./gallery.service";

@UseGuards(AuthGuard)
@Controller("owners/:handle/gallery")
export class GalleryController {
  constructor(private readonly gallery: GalleryService) {}

  @Get()
  async show(@Param("handle") handle: string) {
    return this.gallery.getOwnerGallery(handle);
  }
}
