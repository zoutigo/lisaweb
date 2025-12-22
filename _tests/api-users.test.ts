/** @jest-environment node */

// Mocks
const getServerSessionMock = jest.fn();
jest.mock("next-auth", () => ({
  __esModule: true,
  default: () => jest.fn(),
  getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

jest.mock("@/lib/prisma", () => {
  const prismaUser = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  return { __esModule: true, prisma: { user: prismaUser } };
});
type PrismaUserMock = {
  findMany: jest.Mock;
  findUnique: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};
const prismaUser = (
  jest.requireMock("@/lib/prisma") as { prisma: { user: PrismaUserMock } }
).prisma.user;

// API handlers
import * as usersList from "@/app/api/dashboard/users/route";
import * as userDetail from "@/app/api/dashboard/users/[id]/route";

describe("API /api/dashboard/users", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("refuse les requêtes non authentifiées", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const res = await usersList.GET();
    expect(res.status).toBe(401);
  });

  it("refuse les non-admin", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { email: "u@x.com", isAdmin: false },
    });

    const res = await usersList.GET();
    expect(res.status).toBe(403);
  });

  it("renvoie la liste des utilisateurs pour un admin", async () => {
    const users = [
      {
        id: "1",
        name: "User",
        firstName: "John",
        lastName: "Doe",
        email: "u@x.com",
        isAdmin: false,
      },
    ];
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin@x.com", isAdmin: true },
    });
    prismaUser.findMany.mockResolvedValue(users);

    const res = await usersList.GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(users);
    expect(prismaUser.findMany).toHaveBeenCalled();
  });
});

describe("API /api/dashboard/users/[id]", () => {
  const ctx = { params: Promise.resolve({ id: "user-1" }) };

  beforeEach(() => {
    jest.clearAllMocks();
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin@x.com", isAdmin: true },
    });
  });

  it("renvoie le user pour GET", async () => {
    const user = { id: "user-1", email: "u@x.com" };
    prismaUser.findUnique.mockResolvedValue(user);

    const res = await userDetail.GET(
      new Request("http://x") as unknown as import("next/server").NextRequest,
      ctx,
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(user);
    expect(prismaUser.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
  });

  it("met à jour le user pour PUT", async () => {
    const updated = { id: "user-1", name: "New" };
    prismaUser.update.mockResolvedValue(updated);

    const req = {
      json: () => Promise.resolve({ name: "New" }),
    } as import("next/server").NextRequest;
    const res = await userDetail.PUT(req, ctx);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(updated);
    expect(prismaUser.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        name: "New",
        firstName: undefined,
        lastName: undefined,
        phone: undefined,
        isAdmin: undefined,
      },
    });
  });

  it("supprime le user pour DELETE", async () => {
    prismaUser.delete.mockResolvedValue({ ok: true });

    const res = await userDetail.DELETE(
      new Request("http://x") as unknown as import("next/server").NextRequest,
      ctx,
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(prismaUser.delete).toHaveBeenCalledWith({ where: { id: "user-1" } });
  });

  it("retourne 401 quand non authentifié", async () => {
    getServerSessionMock.mockResolvedValue(null);
    const res = await userDetail.GET(
      new Request("http://x") as unknown as import("next/server").NextRequest,
      ctx,
    );
    expect(res.status).toBe(401);
  });
});
