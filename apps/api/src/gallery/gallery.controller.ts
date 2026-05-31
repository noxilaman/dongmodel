import { Controller, Get, Param } from "@nestjs/common";

@Controller("owners/:handle/gallery")
export class GalleryController {
  @Get()
  show(@Param("handle") handle: string) {
    return { owner: handle, items: [] };
  }
}
