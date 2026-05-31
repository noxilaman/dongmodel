import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ShareController } from "./share.controller";
import { ShareService } from "./share.service";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ShareController],
  providers: [ShareService]
})
export class ShareModule {}
