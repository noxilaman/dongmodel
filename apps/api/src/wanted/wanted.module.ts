import { Module } from "@nestjs/common";
import { WantedController } from "./wanted.controller";

@Module({
  controllers: [WantedController]
})
export class WantedModule {}
