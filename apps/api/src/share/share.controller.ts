import { Controller, Get, Param } from "@nestjs/common";

@Controller("shares")
export class ShareController {
  @Get(":token")
  show(@Param("token") token: string) {
    return { token, status: "stub" };
  }
}
