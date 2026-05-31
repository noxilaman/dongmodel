import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import type { AuthenticatedRequest } from "../auth/authenticated-owner";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly auth: AuthGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await this.auth.canActivate(context);
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (req.owner?.role !== "ADMIN") {
      throw new ForbiddenException("Admin only");
    }
    return true;
  }
}
