import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards
} from "@nestjs/common";
import {
  createWantedListSchema,
  updateWantedListSchema
} from "@dongmodel/shared";
import { AuthGuard } from "../auth/auth.guard";
import type { AuthenticatedOwner } from "../auth/authenticated-owner";
import { CurrentOwner } from "../auth/current-owner.decorator";
import { parseZod } from "../http/parse-zod";
import { WantedListsService } from "./wanted-lists.service";

@UseGuards(AuthGuard)
@Controller("wanted-lists")
export class WantedListsController {
  constructor(private readonly lists: WantedListsService) {}

  @Get()
  async list(@CurrentOwner() owner: AuthenticatedOwner) {
    return { items: await this.lists.list(owner.id), next: null };
  }

  @Get(":id")
  async get(@CurrentOwner() owner: AuthenticatedOwner, @Param("id") id: string) {
    return { item: await this.lists.get(owner.id, id) };
  }

  @Post()
  async create(@CurrentOwner() owner: AuthenticatedOwner, @Body() body: unknown) {
    const input = parseZod(createWantedListSchema, body);
    return { item: await this.lists.create(owner.id, input) };
  }

  @Patch(":id")
  async update(
    @CurrentOwner() owner: AuthenticatedOwner,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const input = parseZod(updateWantedListSchema, body);
    return { item: await this.lists.update(owner.id, id, input) };
  }

  @Delete(":id")
  async delete(@CurrentOwner() owner: AuthenticatedOwner, @Param("id") id: string) {
    return this.lists.delete(owner.id, id);
  }
}
