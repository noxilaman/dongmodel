import { Body, Controller, Get, Post } from "@nestjs/common";
import { createModongSchema } from "@dongmodel/shared";

@Controller("modong")
export class ModongController {
  @Get()
  list() {
    return { items: [], next: null };
  }

  @Post()
  create(@Body() body: unknown) {
    const input = createModongSchema.parse(body);
    return { id: "stub", ...input };
  }
}
