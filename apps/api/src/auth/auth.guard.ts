import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SESSION_COOKIE_NAME } from "./session-cookie";
import type { AuthenticatedRequest } from "./authenticated-owner";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = req.cookies?.[SESSION_COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedException("Not authenticated");
    }

    const owner = await this.auth.getOwnerForSession(token);
    if (!owner) {
      throw new UnauthorizedException("Not authenticated");
    }

    req.owner = owner;
    return true;
  }
}
