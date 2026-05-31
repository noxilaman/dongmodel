import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { WantedController } from "./wanted.controller";
import { WantedService } from "./wanted.service";

@Module({
  imports: [AuthModule],
  controllers: [WantedController],
  providers: [WantedService]
})
export class WantedModule {}
