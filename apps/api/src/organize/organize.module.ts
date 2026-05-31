import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ModongGroupsController } from "./modong-groups.controller";
import { ModongGroupsService } from "./modong-groups.service";
import { WantedListsController } from "./wanted-lists.controller";
import { WantedListsService } from "./wanted-lists.service";

@Module({
  imports: [AuthModule],
  controllers: [ModongGroupsController, WantedListsController],
  providers: [ModongGroupsService, WantedListsService]
})
export class OrganizeModule {}
