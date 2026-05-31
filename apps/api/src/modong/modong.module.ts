import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ModongController } from "./modong.controller";
import { ModongService } from "./modong.service";

@Module({
  imports: [AuthModule],
  controllers: [ModongController],
  providers: [ModongService]
})
export class ModongModule {}
