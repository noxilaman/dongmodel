import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type {
  AuthenticatedOwner,
  AuthenticatedRequest
} from "./authenticated-owner";

export const CurrentOwner = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedOwner => {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!req.owner) {
      throw new Error("CurrentOwner used without AuthGuard");
    }

    return req.owner;
  }
);
