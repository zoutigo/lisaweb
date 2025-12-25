import {
  GET as getCases,
  POST as postCase,
} from "@/app/api/dashboard/customer-cases/route";
import {
  PUT as putCase,
  DELETE as deleteCase,
} from "@/app/api/dashboard/customer-cases/[id]/route";
import { getServerSession } from "next-auth";

jest.mock("@/app/api/auth/[...nextauth]/route", () => ({ authOptions: {} }));
jest.mock("next-auth", () => ({
  __esModule: true,
  default: () => jest.fn(),
  getServerSession: jest.fn(),
}));
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
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  return { prisma: { customerCase } };
});

const sessionMock = getServerSession as jest.Mock;
const prismaMock = jest.requireMock("@/lib/prisma").prisma
  .customerCase as unknown as {
  findMany: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

describe("API customer-cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionMock.mockResolvedValue({
      user: { email: "a@b.com", isAdmin: true },
    });
  });

  it("GET returns cases for admin", async () => {
    prismaMock.findMany.mockResolvedValue([{ id: "c1", title: "Case" }]);
    const res = await getCases();
    const json = await res.json();
    expect(json[0].title).toBe("Case");
  });

  it("POST creates case", async () => {
    prismaMock.create.mockResolvedValue({ id: "c1", title: "Case" });
    const res = await postCase({
      json: async () => ({
        title: "Case",
        customer: "Client",
        description: "Desc suffisante",
        url: "https://exemple.com",
        imageUrl: "https://exemple.com/img.png",
      }),
    } as unknown as Request);
    expect(res.status).toBe(201);
  });

  it("PUT updates case", async () => {
    prismaMock.update.mockResolvedValue({ id: "c1", title: "Upd" });
    const res = await putCase(
      {
        json: async () => ({
          title: "Case",
          description: "Desc suffisante",
        }),
      } as unknown as Request,
      { params: { id: "1" } },
    );
    expect(res.status).toBe(200);
  });

  it("DELETE removes case", async () => {
    prismaMock.delete.mockResolvedValue({});
    const res = await deleteCase({} as unknown as Request, {
      params: { id: "1" },
    });
    expect(res.status).toBe(200);
  });
});
