import { GET } from "@/app/api/customer-cases/featured/route";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      async json() {
        return body;
      },
    }),
  },
}));

jest.mock("@/lib/prisma", () => {
  const customerCase = {
    findFirst: jest.fn(),
  };
  return {
    prisma: { customerCase },
  };
});

const prismaMock = jest.requireMock("@/lib/prisma").prisma.customerCase as {
  findFirst: jest.Mock;
};

describe("API /api/customer-cases/featured", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retourne le cas client mis en avant avec les relations", async () => {
    prismaMock.findFirst.mockResolvedValue({
      id: "c1",
      title: "Case",
      customer: "Client",
      description: "Description",
      url: "https://exemple.com",
      imageUrl: "/img.png",
      results: [{ id: "r1", label: "Resultat", slug: "res" }],
      features: [{ id: "f1", label: "Feature", slug: "feat" }],
    });

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json?.results?.[0]?.label).toBe("Resultat");
    expect(json?.features?.[0]?.label).toBe("Feature");
    expect(prismaMock.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
      }),
    );
  });

  it("retourne null en cas d'erreur", async () => {
    prismaMock.findFirst.mockRejectedValueOnce(new Error("fail"));
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toBeNull();
  });

  it("utilise le fallback actif si aucun cas mis en avant", async () => {
    prismaMock.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "fallback", title: "Fallback case" });
    const res = await GET();
    const json = await res.json();
    expect(json?.id).toBe("fallback");
    expect(prismaMock.findFirst).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({ isFeatured: true, isActive: true }),
      }),
    );
    expect(prismaMock.findFirst).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
      }),
    );
  });
});
