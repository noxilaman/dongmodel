import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import {
  createModongSchema,
  listModongQuerySchema,
  updateModongSchema
} from "@dongmodel/shared";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentOwner } from "../auth/current-owner.decorator";
import type { AuthenticatedOwner } from "../auth/authenticated-owner";
import { parseZod } from "../http/parse-zod";
import { ModongService } from "./modong.service";

@UseGuards(AuthGuard)
@Controller("modong")
export class ModongController {
  constructor(private readonly modong: ModongService) {}

  @Get()
  async list(@CurrentOwner() owner: AuthenticatedOwner, @Query() query: unknown) {
    const parsedQuery = parseZod(listModongQuerySchema, query);
    const items = await this.modong.list(owner.id, parsedQuery);
    return { items, next: null };
  }

  @Get(":id")
  async get(@CurrentOwner() owner: AuthenticatedOwner, @Param("id") id: string) {
    return { item: await this.modong.get(owner.id, id) };
  }

  @Post()
  async create(@CurrentOwner() owner: AuthenticatedOwner, @Body() body: unknown) {
    const input = parseZod(createModongSchema, body);
    return { item: await this.modong.create(owner.id, input) };
  }

  @Patch(":id")
  async update(
    @CurrentOwner() owner: AuthenticatedOwner,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const input = parseZod(updateModongSchema, body);
    return { item: await this.modong.update(owner.id, id, input) };
  }

  @Delete(":id")
  async delete(@CurrentOwner() owner: AuthenticatedOwner, @Param("id") id: string) {
    return this.modong.delete(owner.id, id);
  }
}
