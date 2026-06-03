import { Controller, Get, Query } from "@nestjs/common";
import { CommunityService } from "./community.service";

@Controller("community")
export class CommunityController {
  constructor(private readonly community: CommunityService) {}

  @Get()
  async index(@Query("kindId") kindId?: string) {
    return this.community.getFeed(kindId);
  }
}
