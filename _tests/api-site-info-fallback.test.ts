/** @jest-environment node */

jest.mock("@/lib/prisma", () => {
  const siteInfo = { findFirst: jest.fn() };
  return { __esModule: true, prisma: { siteInfo } };
});

const prisma = jest.requireMock("@/lib/prisma").prisma as {
  siteInfo: { findFirst: jest.Mock };
};

import * as siteInfoRoute from "@/app/api/site-info/route";

describe("API /api/site-info fallback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns fallback when no siteInfo in DB", async () => {
    prisma.siteInfo.findFirst.mockResolvedValue(null);
    const res = await siteInfoRoute.GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(
      expect.objectContaining({
        name: "LiSAWEB",
        email: "contact@lisaweb.fr",
        address: "89C rue du travail",
        city: "Pont de Cheruy",
        postalCode: "38230",
        country: "France",
        phone: "0650597839",
      }),
    );
  });
});
