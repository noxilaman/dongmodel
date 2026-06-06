import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import type { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { compare, hash } from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import type { LoginOwnerInput, RegisterOwnerInput } from "@dongmodel/shared";
import { PrismaService } from "../prisma/prisma.service";
import { SESSION_COOKIE_NAME, sessionCookieMaxAgeMs } from "./session-cookie";

type PublicOwner = {
  id: string;
  email: string;
  displayName: string;
  handle: string;
  role: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  async register(input: RegisterOwnerInput) {
    const existing = await this.prisma.owner.findFirst({
      where: {
        OR: [{ email: input.email }, { handle: input.handle }]
      },
      select: { id: true }
    });

    if (existing) {
      throw new ConflictException("Email or handle is already in use");
    }

    const passwordHash = await hash(input.password, 12);
    const role = this.resolveRole(input.email);
    const owner = await this.prisma.owner.create({
      data: {
        email: input.email,
        passwordHash,
        displayName: input.displayName,
        handle: input.handle,
        role
      },
      select: publicOwnerSelect
    });

    const sessionToken = await this.createSession(owner.id);
    return { owner, sessionToken };
  }

  async login(input: LoginOwnerInput) {
    const owner = await this.prisma.owner.findUnique({
      where: { email: input.email },
      select: {
        ...publicOwnerSelect,
        passwordHash: true
      }
    });

    if (!owner?.passwordHash) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const passwordMatches = await compare(input.password, owner.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const expectedRole = this.resolveRole(owner.email);
    if (owner.role !== expectedRole) {
      await this.prisma.owner.update({
        where: { id: owner.id },
        data: { role: expectedRole }
      });
      owner.role = expectedRole;
    }

    const sessionToken = await this.createSession(owner.id);
    const { passwordHash: _passwordHash, ...publicOwner } = owner;
    return { owner: publicOwner, sessionToken };
  }

  async logout(sessionToken: string) {
    await this.prisma.session.deleteMany({
      where: { tokenHash: this.hashSessionToken(sessionToken) }
    });
  }

  async getOwnerForSession(sessionToken: string): Promise<PublicOwner | null> {
    const session = await this.prisma.session.findUnique({
      where: { tokenHash: this.hashSessionToken(sessionToken) },
      include: {
        owner: {
          select: publicOwnerSelect
        }
      }
    });

    if (!session || session.expiresAt <= new Date()) {
      if (session) {
        await this.prisma.session.delete({ where: { id: session.id } });
      }
      return null;
    }

    return session.owner;
  }

  setSessionCookie(res: Response, sessionToken: string) {
    res.cookie(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: this.isProduction(),
      sameSite: "lax",
      maxAge: sessionCookieMaxAgeMs,
      path: "/"
    });
  }

  clearSessionCookie(res: Response) {
    res.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: this.isProduction(),
      sameSite: "lax",
      path: "/"
    });
  }

  private resolveRole(email: string): "ADMIN" | "OWNER" {
    const adminEmails = this.config.get<string>("ADMIN_EMAILS") ?? "";
    const list = adminEmails.split(",").map((e) => e.trim()).filter(Boolean);
    return list.includes(email) ? "ADMIN" : "OWNER";
  }

  private async createSession(ownerId: string) {
    const sessionToken = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + sessionCookieMaxAgeMs);

    await this.prisma.session.create({
      data: {
        ownerId,
        tokenHash: this.hashSessionToken(sessionToken),
        expiresAt
      }
    });

    return sessionToken;
  }

  private hashSessionToken(sessionToken: string) {
    const secret = this.config.get<string>("SESSION_SECRET");
    if (!secret) {
      throw new Error("SESSION_SECRET is required");
    }

    return createHash("sha256")
      .update(`${secret}:${sessionToken}`)
      .digest("hex");
  }

  private isProduction() {
    return this.config.get<string>("NODE_ENV") === "production";
  }
}

const publicOwnerSelect = {
  id: true,
  email: true,
  displayName: true,
  handle: true,
  role: true
} as const;
