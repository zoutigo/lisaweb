/** @jest-environment node */

const getServerSessionMock = jest.fn();
jest.mock("next-auth", () => ({
  __esModule: true,
  default: () => jest.fn(),
  getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

jest.mock("@/lib/prisma", () => {
  const serviceOffer = {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateMany: jest.fn(),
    findUnique: jest.fn(),
  };
  const serviceOfferFeature = { createMany: jest.fn(), deleteMany: jest.fn() };
  const serviceOfferStep = { createMany: jest.fn(), deleteMany: jest.fn() };
  const serviceOfferUseCase = { createMany: jest.fn(), deleteMany: jest.fn() };
  const txObj = {
    serviceOffer,
    serviceOfferFeature,
    serviceOfferStep,
    serviceOfferUseCase,
  };
  return {
    __esModule: true,
    prisma: {
      ...txObj,
      $transaction: jest.fn(async (cb: (tx: typeof txObj) => unknown) =>
        cb(txObj),
      ),
    },
  };
});

type PrismaMocks = {
  serviceOffer: {
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    updateMany: jest.Mock;
    findUnique: jest.Mock;
  };
  serviceOfferFeature: { createMany: jest.Mock; deleteMany: jest.Mock };
  serviceOfferStep: { createMany: jest.Mock; deleteMany: jest.Mock };
  serviceOfferUseCase: { createMany: jest.Mock; deleteMany: jest.Mock };
  $transaction: jest.Mock;
};
const prisma = jest.requireMock("@/lib/prisma").prisma as PrismaMocks;

import * as adminList from "@/app/api/dashboard/service-offers/route";
import * as adminDetail from "@/app/api/dashboard/service-offers/[id]/route";
import * as publicOffers from "@/app/api/service-offers/route";

describe("API /api/dashboard/service-offers", () => {
  const ctx = {
    params: Promise.resolve({ id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin", isAdmin: true },
    });
  });

  it("returns list for admin", async () => {
    const sample = [{ id: "id1", title: "Offer" }];
    prisma.serviceOffer.findMany.mockResolvedValue(sample);
    const res = await adminList.GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(sample);
  });

  it("rejects unauthenticated POST", async () => {
    getServerSessionMock.mockResolvedValue(null);
    const res = await adminList.POST(
      new Request("http://x", { method: "POST", body: "{}" }),
    );
    expect(res.status).toBe(401);
  });

  it("rejects invalid payload", async () => {
    const res = await adminList.POST(
      new Request("http://x", {
        method: "POST",
        body: JSON.stringify({ title: "x" }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it("creates an offer and related data when valid", async () => {
    prisma.serviceOffer.create.mockResolvedValue({ id: "id1" });
    prisma.serviceOfferFeature.createMany.mockResolvedValue({});
    prisma.serviceOfferStep.createMany.mockResolvedValue({});
    prisma.serviceOfferUseCase.createMany.mockResolvedValue({});
    prisma.serviceOffer.updateMany.mockResolvedValue({});
    prisma.serviceOffer.findUnique.mockResolvedValue({
      id: "id1",
      slug: "site-vitrine",
      title: "Site vitrine",
      subtitle: "",
      shortDescription: "Desc courte",
      longDescription: "Description longue et détaillée pour valider le schéma",
      targetAudience: "TPE",
      priceLabel: "Sur devis",
      durationLabel: "2 semaines",
      engagementLabel: "Forfait",
      isFeatured: true,
      order: 1,
      ctaLabel: "Demander",
      ctaLink: "/contact",
      features: [],
      steps: [],
      useCases: [],
    });
    const payload = {
      slug: "site-vitrine",
      title: "Site vitrine",
      subtitle: "",
      shortDescription: "Desc courte",
      longDescription: "Description longue et détaillée pour valider le schéma",
      targetAudience: "TPE",
      priceLabel: "Sur devis",
      durationLabel: "2 semaines",
      engagementLabel: "Forfait",
      isFeatured: true,
      order: 1,
      ctaLabel: "Demander",
      ctaLink: "/contact",
      features: [{ label: "Clé en main", icon: "✅" }],
      steps: [{ title: "Analyse", description: "Comprendre", order: 0 }],
      useCases: [{ title: "Site local", description: "Visibilité" }],
    };
    const res = await adminList.POST(
      new Request("http://x", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
    expect(res.status).toBe(201);
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.serviceOffer.updateMany).toHaveBeenCalledWith({
      data: { isFeatured: false },
      where: { isFeatured: true },
    });
    expect(prisma.serviceOfferFeature.createMany).toHaveBeenCalled();
    expect(prisma.serviceOfferStep.createMany).toHaveBeenCalled();
    expect(prisma.serviceOfferUseCase.createMany).toHaveBeenCalled();
  });

  it("updates an offer", async () => {
    prisma.serviceOffer.update.mockResolvedValue({ id: "id1" });
    prisma.serviceOffer.findUnique.mockResolvedValue({
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      slug: "site-vitrine",
      title: "Titre",
      subtitle: "",
      shortDescription: "Desc courte",
      longDescription: "Description longue et détaillée pour valider",
      targetAudience: "TPE",
      priceLabel: "Sur devis",
      durationLabel: "2 semaines",
      engagementLabel: "Forfait",
      isFeatured: false,
      order: 1,
      ctaLabel: "Demander",
      ctaLink: "/contact",
      features: [],
      steps: [],
      useCases: [],
    });
    const res = await adminDetail.PUT(
      new Request("http://x", {
        method: "PUT",
        body: JSON.stringify({
          slug: "site-vitrine",
          title: "Titre",
          subtitle: "",
          shortDescription: "Desc courte",
          longDescription: "Description longue et détaillée pour valider",
          targetAudience: "TPE",
          priceLabel: "Sur devis",
          durationLabel: "2 semaines",
          engagementLabel: "Forfait",
          isFeatured: false,
          order: 1,
          ctaLabel: "Demander",
          ctaLink: "/contact",
          features: [],
          steps: [],
          useCases: [],
        }),
      }) as unknown as import("next/server").NextRequest,
      ctx,
    );
    expect(res.status).toBe(200);
    expect(prisma.serviceOffer.update).toHaveBeenCalledWith({
      where: { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" },
      data: expect.objectContaining({ title: "Titre" }),
    });
    expect(prisma.serviceOfferFeature.deleteMany).toHaveBeenCalled();
  });

  it("deletes an offer", async () => {
    prisma.serviceOffer.delete.mockResolvedValue({ ok: true });
    const res = await adminDetail.DELETE(
      new Request("http://x") as unknown as import("next/server").NextRequest,
      ctx,
    );
    expect(res.status).toBe(200);
    expect(prisma.serviceOffer.delete).toHaveBeenCalledWith({
      where: { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" },
    });
  });
});

describe("Public API /api/service-offers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.serviceOffer.findMany.mockResolvedValue([]);
  });

  it("returns offers publicly", async () => {
    prisma.serviceOffer.findMany.mockResolvedValue([
      { id: "id1", title: "Offer" },
    ]);
    const res = await publicOffers.GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ id: "id1", title: "Offer" }]);
  });
});
