import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards
} from "@nestjs/common";
import type { Request, Response } from "express";
import { loginOwnerSchema, registerOwnerSchema } from "@dongmodel/shared";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import type { AuthenticatedOwner } from "./authenticated-owner";
import { CurrentOwner } from "./current-owner.decorator";
import { SESSION_COOKIE_NAME } from "./session-cookie";
import { parseZod } from "../http/parse-zod";

type CookieRequest = Request & {
  cookies?: Record<string, string | undefined>;
};

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get("health")
  health() {
    return { module: "auth", status: "ok" };
  }

  @Post("register")
  async register(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const input = parseZod(registerOwnerSchema, body);
    const result = await this.auth.register(input);
    this.auth.setSessionCookie(res, result.sessionToken);
    return { owner: result.owner };
  }

  @Post("login")
  async login(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const input = parseZod(loginOwnerSchema, body);
    const result = await this.auth.login(input);
    this.auth.setSessionCookie(res, result.sessionToken);
    return { owner: result.owner };
  }

  @Post("logout")
  async logout(@Req() req: CookieRequest, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[SESSION_COOKIE_NAME];
    if (token) {
      await this.auth.logout(token);
    }
    this.auth.clearSessionCookie(res);
    return { ok: true };
  }

  @UseGuards(AuthGuard)
  @Get("me")
  me(@CurrentOwner() owner: AuthenticatedOwner) {
    return { owner };
  }
}
