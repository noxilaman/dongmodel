import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentOwner } from "../auth/current-owner.decorator";
import type { AuthenticatedOwner } from "../auth/authenticated-owner";
import { SummaryService } from "./summary.service";

@Controller("owner-summary")
@UseGuards(AuthGuard)
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get()
  show(@CurrentOwner() owner: AuthenticatedOwner) {
    return this.summaryService.show(owner.id);
  }
}
