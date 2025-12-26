import { GET as getCases } from "@/app/api/customer-cases/route";

jest.mock("@/lib/prisma", () => {
  const customerCase = { findMany: jest.fn() };
  return {
    __esModule: true,
    prisma: { customerCase },
  };
});

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

const prismaMock = jest.requireMock("@/lib/prisma").prisma.customerCase as {
  findMany: jest.Mock;
};

describe("API /api/customer-cases (public)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renvoie les cas clients triés", async () => {
    prismaMock.findMany.mockResolvedValue([{ id: "1", title: "Case" }]);
    const res = await getCases();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json[0].title).toBe("Case");
    expect(prismaMock.findMany).toHaveBeenCalled();
  });

  it("retourne un fallback [] en cas d'erreur", async () => {
    prismaMock.findMany.mockRejectedValue(new Error("db down"));
    const res = await getCases();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toEqual([]);
  });
});
