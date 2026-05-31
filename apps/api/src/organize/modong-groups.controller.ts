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
  createModongGroupSchema,
  modongGroupMembershipSchema,
  updateModongGroupSchema
} from "@dongmodel/shared";
import { AuthGuard } from "../auth/auth.guard";
import type { AuthenticatedOwner } from "../auth/authenticated-owner";
import { CurrentOwner } from "../auth/current-owner.decorator";
import { parseZod } from "../http/parse-zod";
import { ModongGroupsService } from "./modong-groups.service";

@UseGuards(AuthGuard)
@Controller("modong-groups")
export class ModongGroupsController {
  constructor(private readonly groups: ModongGroupsService) {}

  @Get()
  async list(@CurrentOwner() owner: AuthenticatedOwner) {
    return { items: await this.groups.list(owner.id), next: null };
  }

  @Get(":id")
  async get(@CurrentOwner() owner: AuthenticatedOwner, @Param("id") id: string) {
    return { item: await this.groups.get(owner.id, id) };
  }

  @Post()
  async create(@CurrentOwner() owner: AuthenticatedOwner, @Body() body: unknown) {
    const input = parseZod(createModongGroupSchema, body);
    return { item: await this.groups.create(owner.id, input) };
  }

  @Patch(":id")
  async update(
    @CurrentOwner() owner: AuthenticatedOwner,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const input = parseZod(updateModongGroupSchema, body);
    return { item: await this.groups.update(owner.id, id, input) };
  }

  @Delete(":id")
  async delete(@CurrentOwner() owner: AuthenticatedOwner, @Param("id") id: string) {
    return this.groups.delete(owner.id, id);
  }

  @Post(":id/items")
  async addModong(
    @CurrentOwner() owner: AuthenticatedOwner,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const input = parseZod(modongGroupMembershipSchema, body);
    return { item: await this.groups.addModong(owner.id, id, input.modongId) };
  }

  @Delete(":id/items/:modongId")
  async removeModong(
    @CurrentOwner() owner: AuthenticatedOwner,
    @Param("id") id: string,
    @Param("modongId") modongId: string
  ) {
    return this.groups.removeModong(owner.id, id, modongId);
  }
}
