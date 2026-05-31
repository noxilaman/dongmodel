import { Body, Controller, Get, Post } from "@nestjs/common";
import { createWantedItemSchema } from "@dongmodel/shared";

@Controller("wanted")
export class WantedController {
  @Get()
  list() {
    return { items: [], next: null };
  }

  @Post()
  create(@Body() body: unknown) {
    const input = createWantedItemSchema.parse(body);
    return { id: "stub", ...input };
  }
}
