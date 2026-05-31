import { Module } from "@nestjs/common";
import { ModongController } from "./modong.controller";

@Module({
  controllers: [ModongController]
})
export class ModongModule {}
