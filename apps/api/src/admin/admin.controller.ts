import { Controller, Get } from "@nestjs/common";

@Controller("admin")
export class AdminController {
  @Get("collectible-kinds")
  kinds() {
    return { items: [] };
  }
}
