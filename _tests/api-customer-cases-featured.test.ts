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
  });

  it("retourne null en cas d'erreur", async () => {
    prismaMock.findFirst.mockRejectedValueOnce(new Error("fail"));
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toBeNull();
  });
});
