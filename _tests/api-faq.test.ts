/** @jest-environment node */

import type { NextRequest } from "next/server";

const getServerSessionMock = jest.fn();
jest.mock("next-auth", () => ({
  __esModule: true,
  default: () => jest.fn(),
  getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

jest.mock("@/lib/prisma", () => {
  const faq = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const faqCategory = {
    findMany: jest.fn(),
    createMany: jest.fn(),
    count: jest.fn(),
  };
  return { __esModule: true, prisma: { faq, faqCategory } };
});

type FaqMock = {
  findMany: jest.Mock;
  findUnique: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

const prismaFaq = (
  jest.requireMock("@/lib/prisma") as {
    prisma: { faq: FaqMock; faqCategory: FaqCategoryMock };
  }
).prisma.faq;
type FaqCategoryMock = {
  findMany: jest.Mock;
  createMany: jest.Mock;
  count: jest.Mock;
};
const prismaFaqCategory = (
  jest.requireMock("@/lib/prisma") as {
    prisma: { faq: FaqMock; faqCategory: FaqCategoryMock };
  }
).prisma.faqCategory;

import * as faqList from "@/app/api/dashboard/faq/route";
import * as faqDetail from "@/app/api/dashboard/faq/[id]/route";

describe("API /api/dashboard/faq", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin@x.com", isAdmin: true },
    });
    prismaFaqCategory.findMany.mockResolvedValue([
      { id: "11111111-1111-1111-1111-111111111111", name: "Général", order: 1 },
    ]);
    prismaFaqCategory.count.mockResolvedValue(1);
  });

  it("retourne la liste des FAQ", async () => {
    const items = [
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        question: "Q?",
        answer: "A",
        createdAt: new Date().toISOString(),
        categoryId: "11111111-1111-1111-1111-111111111111",
      },
    ];
    prismaFaq.findMany.mockResolvedValue(items);
    const res = await faqList.GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      faqs: items,
      categories: [
        {
          id: "11111111-1111-1111-1111-111111111111",
          name: "Général",
          order: 1,
        },
      ],
    });
  });

  it("rejette un POST sans session", async () => {
    getServerSessionMock.mockResolvedValue(null);
    const res = await faqList.POST(
      new Request("http://x", {
        method: "POST",
        body: "{}",
      }) as unknown as NextRequest,
    );
    expect(res.status).toBe(401);
  });

  it("rejette un POST invalide", async () => {
    const res = await faqList.POST(
      new Request("http://x", {
        method: "POST",
        body: JSON.stringify({ question: "1234" }),
      }) as unknown as NextRequest,
    );
    expect(res.status).toBe(422);
  });

  it("crée une FAQ quand admin et payload valide", async () => {
    prismaFaq.create.mockResolvedValue({
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      question: "Q",
      answer: "A",
      categoryId: "11111111-1111-1111-1111-111111111111",
    });
    const payload = {
      question: "Question valide",
      answer: "Réponse valide",
      categoryId: "11111111-1111-1111-1111-111111111111",
    };
    const res = await faqList.POST(
      new Request("http://x", {
        method: "POST",
        body: JSON.stringify(payload),
      }) as unknown as NextRequest,
    );
    expect(res.status).toBe(201);
    expect(prismaFaq.create).toHaveBeenCalledWith({
      data: payload,
    });
  });
});

describe("API /api/dashboard/faq/[id]", () => {
  const ctx = {
    params: Promise.resolve({ id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin@x.com", isAdmin: true },
    });
  });

  it("renvoie 400 si id manquant", async () => {
    const badCtx = { params: Promise.resolve({ id: "" }) };
    const res = await faqDetail.GET(
      new Request("http://x") as unknown as NextRequest,
      badCtx,
    );
    expect(res.status).toBe(400);
  });

  it("renvoie 404 si non trouvé", async () => {
    prismaFaq.findUnique.mockResolvedValue(null);
    const res = await faqDetail.GET(
      new Request("http://x") as unknown as NextRequest,
      ctx,
    );
    expect(res.status).toBe(404);
  });

  it("met à jour une FAQ", async () => {
    prismaFaq.update.mockResolvedValue({
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      question: "Q",
      answer: "A",
      categoryId: "11111111-1111-1111-1111-111111111111",
    });
    prismaFaq.findUnique.mockResolvedValue({
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      categoryId: "11111111-1111-1111-1111-111111111111",
    });
    const payload = {
      question: "Nouvelle question",
      answer: "Nouvelle réponse",
      categoryId: "11111111-1111-1111-1111-111111111111",
    };
    const res = await faqDetail.PUT(
      new Request("http://x", {
        method: "PUT",
        body: JSON.stringify(payload),
      }) as unknown as NextRequest,
      ctx,
    );
    expect(res.status).toBe(200);
    expect(prismaFaq.update).toHaveBeenCalledWith({
      where: { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" },
      data: payload,
    });
  });

  it("rejette une mise à jour invalide", async () => {
    const res = await faqDetail.PUT(
      new Request("http://x", {
        method: "PUT",
        body: JSON.stringify({ question: "abc" }),
      }) as unknown as NextRequest,
      ctx,
    );
    expect(res.status).toBe(422);
  });

  it("supprime une FAQ", async () => {
    prismaFaq.delete.mockResolvedValue({
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    });
    const res = await faqDetail.DELETE(
      new Request("http://x") as unknown as NextRequest,
      ctx,
    );
    expect(res.status).toBe(200);
    expect(prismaFaq.delete).toHaveBeenCalledWith({
      where: { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" },
    });
  });
});
