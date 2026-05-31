import type { Request } from "express";

export type AuthenticatedOwner = {
  id: string;
  email: string;
  displayName: string;
  handle: string;
  role: string;
};

export type AuthenticatedRequest = Request & {
  owner?: AuthenticatedOwner;
  cookies?: Record<string, string | undefined>;
};
