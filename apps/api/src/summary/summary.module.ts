import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SummaryController } from "./summary.controller";
import { SummaryService } from "./summary.service";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SummaryController],
  providers: [SummaryService]
})
export class SummaryModule {}
