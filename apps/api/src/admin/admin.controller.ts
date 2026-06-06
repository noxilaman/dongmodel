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
import { z } from "zod";
import { AuthGuard } from "../auth/auth.guard";
import { parseZod } from "../http/parse-zod";
import { AdminGuard } from "./admin.guard";
import { AdminService } from "./admin.service";

const createKindSchema = z.object({
  name: z.string().trim().min(1).max(100)
});

const updateKindSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  isActive: z.boolean().optional()
});

@Controller("admin")
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  // Public — used by Modong/Wanted forms to populate the selector
  @Get("collectible-kinds")
  async listKinds() {
    return { items: await this.admin.listKinds() };
  }

  @UseGuards(AdminGuard)
  @Post("collectible-kinds")
  async createKind(@Body() body: unknown) {
    const { name } = parseZod(createKindSchema, body);
    return { item: await this.admin.createKind(name) };
  }

  @UseGuards(AdminGuard)
  @Patch("collectible-kinds/:id")
  async updateKind(@Param("id") id: string, @Body() body: unknown) {
    const input = parseZod(updateKindSchema, body);
    return { item: await this.admin.updateKind(id, input.name, input.isActive) };
  }

  @UseGuards(AdminGuard)
  @Delete("collectible-kinds/:id")
  async deleteKind(@Param("id") id: string) {
    return this.admin.deleteKind(id);
  }

  @UseGuards(AdminGuard)
  @Get("users")
  async listUsers() {
    return { items: await this.admin.listUsers() };
  }
}
