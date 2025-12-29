import { POST as postQuote } from "@/app/api/quotes/route";
import { getServerSession } from "next-auth";

jest.mock("@/app/api/auth/[...nextauth]/route", () => ({ authOptions: {} }));
jest.mock("next-auth", () => ({
  __esModule: true,
  getServerSession: jest.fn(),
}));
jest.mock("nodemailer", () => {
  const sendMail = jest.fn().mockResolvedValue(true);
  return {
    __esModule: true,
    default: {
      createTransport: () => ({ sendMail }),
    },
    createTransport: () => ({ sendMail }),
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
jest.mock("@/lib/prisma", () => {
  const quoteRequest = {
    create: jest.fn(),
  };
  const rendezvous = {
    create: jest.fn(),
  };
  const user = {
    findUnique: jest.fn(),
  };
  const siteInfo = {
    findFirst: jest.fn().mockResolvedValue(null),
  };
  return {
    prisma: {
      quoteRequest,
      rendezvous,
      user,
      siteInfo,
    },
  };
});

const sessionMock = getServerSession as jest.Mock;
const prismaMock = jest.requireMock("@/lib/prisma").prisma as {
  quoteRequest: { create: jest.Mock };
  rendezvous: { create: jest.Mock };
  user: { findUnique: jest.Mock };
  siteInfo: { findFirst: jest.Mock };
};

describe("API /api/quotes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionMock.mockResolvedValue({ user: { email: "u@test.com", id: "uid" } });
    prismaMock.user.findUnique.mockResolvedValue({ id: "uid" });
    prismaMock.rendezvous.create.mockResolvedValue({ id: "rdv1" });
    prismaMock.quoteRequest.create.mockResolvedValue({
      id: "q1",
      serviceOffer: { title: "Offre A" },
      offerOptions: [{ title: "Opt A" }],
    });
  });

  it("crée un devis et retourne 201", async () => {
    const res = await postQuote({
      json: async () => ({
        firstName: "A",
        lastName: "B",
        email: "u@test.com",
        projectDescription: "Un projet assez long",
        desiredDeliveryDate: "2099-01-01",
        serviceOfferId: "offer1",
        offerOptionIds: ["opt1"],
      }),
    } as unknown as Request);

    expect(res.status).toBe(201);
    expect(prismaMock.quoteRequest.create).toHaveBeenCalled();
  });

  it("retourne 400 avec message clair si validation échoue", async () => {
    const res = await postQuote({
      json: async () => ({
        firstName: "A",
        lastName: "B",
        email: "not-an-email",
        projectDescription: "Court",
      }),
    } as unknown as Request);

    expect(res.status).toBe(400);
    const payload = await res.json();
    expect(typeof payload.error).toBe("string");
  });
});
