import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards
} from "@nestjs/common";
import { z } from "zod";
import { AuthGuard } from "../auth/auth.guard";
import type { AuthenticatedOwner } from "../auth/authenticated-owner";
import { CurrentOwner } from "../auth/current-owner.decorator";
import { parseZod } from "../http/parse-zod";
import { ShareService } from "./share.service";

const createShareSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("MODONG"), modongId: z.string().uuid() }),
  z.object({
    kind: z.literal("MODONG_GROUP"),
    modongGroupId: z.string().uuid(),
    featuredModongIds: z.array(z.string().uuid()).max(5).default([])
  }),
  z.object({ kind: z.literal("WANTED"), wantedItemId: z.string().uuid() })
]);

@Controller("shares")
export class ShareController {
  constructor(private readonly shares: ShareService) {}

  @Get(":token")
  async show(@Param("token") token: string) {
    return this.shares.getPublicShare(token);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(@CurrentOwner() owner: AuthenticatedOwner, @Body() body: unknown) {
    const input = parseZod(createShareSchema, body);
    switch (input.kind) {
      case "MODONG":
        return this.shares.createModongShare(owner.id, input.modongId);
      case "MODONG_GROUP":
        return this.shares.createModongGroupShare(
          owner.id,
          input.modongGroupId,
          input.featuredModongIds
        );
      case "WANTED":
        return this.shares.createWantedShare(owner.id, input.wantedItemId);
    }
  }

  @UseGuards(AuthGuard)
  @Delete(":token")
  async revoke(@CurrentOwner() owner: AuthenticatedOwner, @Param("token") token: string) {
    return this.shares.revokeShare(owner.id, token);
  }
}
