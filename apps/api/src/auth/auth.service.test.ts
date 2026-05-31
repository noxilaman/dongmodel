import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { hash } from "bcryptjs";
import { AuthService } from "./auth.service";
import { SESSION_COOKIE_NAME, sessionCookieMaxAgeMs } from "./session-cookie";

const publicOwner = {
  id: "owner-1",
  email: "noxil@example.com",
  displayName: "พี่นอ",
  handle: "noxil",
  role: "OWNER"
};

function createPrismaMock() {
  return {
    owner: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn()
    },
    session: {
      create: vi.fn(),
      deleteMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn()
    }
  };
}

function createService({
  nodeEnv = "test",
  sessionSecret
}: { nodeEnv?: string; sessionSecret?: string | undefined } = {}) {
  const resolvedSessionSecret =
    arguments[0] && "sessionSecret" in arguments[0]
      ? sessionSecret
      : "unit-test-secret";
  const prisma = createPrismaMock();
  const config = {
    get: vi.fn((key: string) => {
      if (key === "SESSION_SECRET") {
        return resolvedSessionSecret;
      }
      if (key === "NODE_ENV") {
        return nodeEnv;
      }
      return undefined;
    })
  };

  return {
    prisma,
    config,
    service: new AuthService(prisma as never, config as never)
  };
}

describe("AuthService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("registers an owner and creates a session", async () => {
    const { prisma, service } = createService();
    prisma.owner.findFirst.mockResolvedValue(null);
    prisma.owner.create.mockResolvedValue(publicOwner);
    prisma.session.create.mockResolvedValue({ id: "session-1" });

    const result = await service.register({
      email: "noxil@example.com",
      password: "password123",
      displayName: "พี่นอ",
      handle: "noxil"
    });

    expect(result.owner).toEqual(publicOwner);
    expect(result.sessionToken).toEqual(expect.any(String));
    expect(prisma.owner.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "noxil@example.com",
        displayName: "พี่นอ",
        handle: "noxil",
        passwordHash: expect.any(String)
      }),
      select: expect.any(Object)
    });
    expect(prisma.session.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ownerId: publicOwner.id,
        tokenHash: expect.any(String),
        expiresAt: expect.any(Date)
      })
    });
  });

  it("rejects duplicate registration identity", async () => {
    const { prisma, service } = createService();
    prisma.owner.findFirst.mockResolvedValue({ id: "existing-owner" });

    await expect(
      service.register({
        email: "noxil@example.com",
        password: "password123",
        displayName: "พี่นอ",
        handle: "noxil"
      })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("logs in with a valid password and omits passwordHash", async () => {
    const { prisma, service } = createService();
    prisma.owner.findUnique.mockResolvedValue({
      ...publicOwner,
      passwordHash: await hash("password123", 4)
    });
    prisma.session.create.mockResolvedValue({ id: "session-1" });

    const result = await service.login({
      email: "noxil@example.com",
      password: "password123"
    });

    expect(result.owner).toEqual(publicOwner);
    expect(result.owner).not.toHaveProperty("passwordHash");
    expect(result.sessionToken).toEqual(expect.any(String));
  });

  it("rejects login with invalid credentials", async () => {
    const { prisma, service } = createService();
    prisma.owner.findUnique.mockResolvedValue({
      ...publicOwner,
      passwordHash: await hash("password123", 4)
    });

    await expect(
      service.login({
        email: "noxil@example.com",
        password: "wrong-password"
      })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("returns owner for a valid session", async () => {
    const { prisma, service } = createService();
    prisma.session.findUnique.mockResolvedValue({
      id: "session-1",
      expiresAt: new Date(Date.now() + 60_000),
      owner: publicOwner
    });

    await expect(service.getOwnerForSession("token")).resolves.toEqual(
      publicOwner
    );
  });

  it("deletes and rejects an expired session", async () => {
    const { prisma, service } = createService();
    prisma.session.findUnique.mockResolvedValue({
      id: "session-1",
      expiresAt: new Date(Date.now() - 60_000),
      owner: publicOwner
    });
    prisma.session.delete.mockResolvedValue({ id: "session-1" });

    await expect(service.getOwnerForSession("token")).resolves.toBeNull();
    expect(prisma.session.delete).toHaveBeenCalledWith({
      where: { id: "session-1" }
    });
  });

  it("sets and clears HTTP-only session cookies", () => {
    const { service } = createService({ nodeEnv: "production" });
    const res = {
      cookie: vi.fn(),
      clearCookie: vi.fn()
    };

    service.setSessionCookie(res as never, "session-token");
    service.clearSessionCookie(res as never);

    expect(res.cookie).toHaveBeenCalledWith(
      SESSION_COOKIE_NAME,
      "session-token",
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: sessionCookieMaxAgeMs,
        path: "/"
      }
    );
    expect(res.clearCookie).toHaveBeenCalledWith(SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/"
    });
  });

  it("requires SESSION_SECRET before creating hashed sessions", async () => {
    const { prisma, service } = createService({ sessionSecret: undefined });
    prisma.owner.findFirst.mockResolvedValue(null);
    prisma.owner.create.mockResolvedValue(publicOwner);

    await expect(
      service.register({
        email: "noxil@example.com",
        password: "password123",
        displayName: "พี่นอ",
        handle: "noxil"
      })
    ).rejects.toThrow("SESSION_SECRET is required");
  });
});
