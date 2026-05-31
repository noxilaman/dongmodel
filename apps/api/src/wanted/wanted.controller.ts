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
  createWantedItemSchema,
  listWantedItemsQuerySchema,
  updateWantedItemSchema
} from "@dongmodel/shared";
import { AuthGuard } from "../auth/auth.guard";
import type { AuthenticatedOwner } from "../auth/authenticated-owner";
import { CurrentOwner } from "../auth/current-owner.decorator";
import { parseZod } from "../http/parse-zod";
import { WantedService } from "./wanted.service";

@UseGuards(AuthGuard)
@Controller("wanted")
export class WantedController {
  constructor(private readonly wanted: WantedService) {}

  @Get()
  async list(@CurrentOwner() owner: AuthenticatedOwner, @Query() query: unknown) {
    const parsedQuery = parseZod(listWantedItemsQuerySchema, query);
    const items = await this.wanted.list(owner.id, parsedQuery);
    return { items, next: null };
  }

  @Get(":id")
  async get(@CurrentOwner() owner: AuthenticatedOwner, @Param("id") id: string) {
    return { item: await this.wanted.get(owner.id, id) };
  }

  @Post()
  async create(@CurrentOwner() owner: AuthenticatedOwner, @Body() body: unknown) {
    const input = parseZod(createWantedItemSchema, body);
    return { item: await this.wanted.create(owner.id, input) };
  }

  @Patch(":id")
  async update(
    @CurrentOwner() owner: AuthenticatedOwner,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const input = parseZod(updateWantedItemSchema, body);
    return { item: await this.wanted.update(owner.id, id, input) };
  }

  @Delete(":id")
  async delete(@CurrentOwner() owner: AuthenticatedOwner, @Param("id") id: string) {
    return this.wanted.delete(owner.id, id);
  }
}
