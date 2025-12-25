/** @jest-environment node */

const getServerSessionMock = jest.fn();
jest.mock("next-auth", () => ({
  __esModule: true,
  default: () => jest.fn(),
  getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

jest.mock("@/lib/prisma", () => {
  const partner = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  return { __esModule: true, prisma: { partner } };
});
type PartnerMock = {
  findMany: jest.Mock;
  findUnique: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};
const prismaPartner = (
  jest.requireMock("@/lib/prisma") as { prisma: { partner: PartnerMock } }
).prisma.partner;

import * as partnersList from "@/app/api/dashboard/partners/route";
import * as partnerDetail from "@/app/api/dashboard/partners/[id]/route";

describe("API /api/dashboard/partners", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin", isAdmin: true },
    });
  });

  it("returns partners list", async () => {
    const partners = [
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        name: "ACME",
        url: "https://acme.test",
      },
    ];
    prismaPartner.findMany.mockResolvedValue(partners);
    const res = await partnersList.GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(partners);
  });

  it("rejects unauthenticated POST", async () => {
    getServerSessionMock.mockResolvedValue(null);
    const res = await partnersList.POST(
      new Request("http://x", { method: "POST", body: "{}" }),
    );
    expect(res.status).toBe(401);
  });

  it("rejects invalid payload", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin", isAdmin: true },
    });
    const res = await partnersList.POST(
      new Request("http://x", {
        method: "POST",
        body: JSON.stringify({ name: "ACME" }),
      }),
    );
    expect(res.status).toBe(422);
  });

  it("creates partner when valid and admin", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin", isAdmin: true },
    });
    prismaPartner.create.mockResolvedValue({
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      name: "ACME",
      url: "https://acme.test",
    });
    const payload = {
      name: "ACME",
      url: "https://acme.test",
      logoUrl: "/files/logo.png",
    };
    const res = await partnersList.POST(
      new Request("http://x", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
    expect(res.status).toBe(200);
    expect(prismaPartner.create).toHaveBeenCalledWith({
      data: {
        name: "ACME",
        url: "https://acme.test",
        logoUrl: "/files/logo.png",
      },
    });
  });
});

describe("API /api/dashboard/partners/[id]", () => {
  const ctx = {
    params: Promise.resolve({ id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin", isAdmin: true },
    });
  });

  it("gets a partner", async () => {
    prismaPartner.findUnique.mockResolvedValue({
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      name: "ACME",
    });
    const res = await partnerDetail.GET(
      new Request("http://x") as unknown as import("next/server").NextRequest,
      ctx,
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      name: "ACME",
    });
  });

  it("updates a partner", async () => {
    prismaPartner.update.mockResolvedValue({
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      name: "New",
    });
    const payload = {
      name: "New",
      url: "https://new.test",
      logoUrl: "/files/x.png",
    };
    const res = await partnerDetail.PUT(
      new Request("http://x", {
        method: "PUT",
        body: JSON.stringify(payload),
      }) as unknown as import("next/server").NextRequest,
      ctx,
    );
    expect(res.status).toBe(200);
    expect(prismaPartner.update).toHaveBeenCalledWith({
      where: { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" },
      data: { name: "New", url: "https://new.test", logoUrl: "/files/x.png" },
    });
  });

  it("deletes a partner", async () => {
    prismaPartner.delete.mockResolvedValue({ success: true });
    const res = await partnerDetail.DELETE(
      new Request("http://x") as unknown as import("next/server").NextRequest,
      ctx,
    );
    expect(res.status).toBe(200);
    expect(prismaPartner.delete).toHaveBeenCalledWith({
      where: { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" },
    });
  });

  it("returns 400 on missing id", async () => {
    const badCtx = { params: Promise.resolve({ id: "" }) };
    const res = await partnerDetail.GET(
      new Request("http://x") as unknown as import("next/server").NextRequest,
      badCtx,
    );
    expect(res.status).toBe(400);
  });
});
