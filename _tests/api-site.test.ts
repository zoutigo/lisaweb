/** @jest-environment node */

const getServerSessionMock = jest.fn();
jest.mock("next-auth", () => ({
  __esModule: true,
  default: () => jest.fn(),
  getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

jest.mock("@/lib/prisma", () => {
  const siteInfo = {
    findFirst: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  };
  return { __esModule: true, prisma: { siteInfo } };
});
type SiteInfoMock = {
  findFirst: jest.Mock;
  update: jest.Mock;
  create: jest.Mock;
};
const prismaSiteInfo = (
  jest.requireMock("@/lib/prisma") as { prisma: { siteInfo: SiteInfoMock } }
).prisma.siteInfo;

import * as siteHandlers from "@/app/api/dashboard/site/route";

describe("API /api/dashboard/site", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET returns site info or null", async () => {
    prismaSiteInfo.findFirst.mockResolvedValue({
      name: "Site",
      email: "a@x.com",
    });
    const res = await siteHandlers.GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ name: "Site", email: "a@x.com" });
  });

  it("PUT rejects unauthenticated", async () => {
    getServerSessionMock.mockResolvedValue(null);
    const res = await siteHandlers.PUT(
      new Request("http://x", { method: "PUT", body: "{}" }),
    );
    expect(res.status).toBe(401);
  });

  it("PUT rejects non-admin", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { email: "u", isAdmin: false },
    });
    const res = await siteHandlers.PUT(
      new Request("http://x", { method: "PUT", body: "{}" }),
    );
    expect(res.status).toBe(403);
  });

  it("PUT rejects invalid payload", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin", isAdmin: true },
    });
    const res = await siteHandlers.PUT(
      new Request("http://x", { method: "PUT", body: JSON.stringify({}) }),
    );
    expect(res.status).toBe(422);
  });

  it("PUT updates existing site info", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin", isAdmin: true },
    });
    prismaSiteInfo.findFirst.mockResolvedValue({ id: 1 });
    prismaSiteInfo.update.mockResolvedValue({
      id: 1,
      name: "Site",
      email: "x@y.com",
    });
    const payload = {
      name: "Site",
      email: "x@y.com",
      address: "1 rue",
      city: "Paris",
      postalCode: "75000",
      country: "France",
      phone: "+33123456789",
    };
    const res = await siteHandlers.PUT(
      new Request("http://x", { method: "PUT", body: JSON.stringify(payload) }),
    );
    expect(res.status).toBe(200);
    expect(prismaSiteInfo.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: payload,
    });
  });

  it("PUT creates site info when none exists", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin", isAdmin: true },
    });
    prismaSiteInfo.findFirst.mockResolvedValue(null);
    prismaSiteInfo.create.mockResolvedValue({ id: 2, name: "Site" });
    const payload = {
      name: "Site",
      email: "x@y.com",
      address: "1 rue",
      city: "Paris",
      postalCode: "75000",
      country: "France",
      phone: "+33123456789",
    };
    const res = await siteHandlers.PUT(
      new Request("http://x", { method: "PUT", body: JSON.stringify(payload) }),
    );
    expect(res.status).toBe(200);
    expect(prismaSiteInfo.create).toHaveBeenCalledWith({ data: payload });
  });
});
