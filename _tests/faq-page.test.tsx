/** @jest-environment node */

jest.mock("@/lib/prisma", () => {
  const faqCategory = {
    findMany: jest.fn(),
    createMany: jest.fn(),
    count: jest.fn(),
  };
  const faq = {
    findMany: jest.fn(),
  };
  return { __esModule: true, prisma: { faqCategory, faq } };
});

import FAQPage from "@/app/faq/page";
import { renderToString } from "react-dom/server";
import React from "react";

const prismaMock = jest.requireMock("@/lib/prisma").prisma as {
  faqCategory: {
    findMany: jest.Mock;
    createMany: jest.Mock;
    count: jest.Mock;
  };
  faq: {
    findMany: jest.Mock;
  };
};

describe("Page /faq", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.faqCategory.count.mockResolvedValue(1);
    prismaMock.faqCategory.findMany.mockResolvedValue([
      { id: 1, name: "Général", order: 1 },
    ]);
    prismaMock.faq.findMany.mockResolvedValue([
      {
        id: 1,
        question: "Combien ça coûte ?",
        answer: "Une estimation selon le besoin.",
        categoryId: 1,
        createdAt: new Date(),
        category: { id: 1, name: "Général", order: 1 },
      },
    ]);
  });

  it("affiche le titre et les questions par catégorie", async () => {
    const ui = await FAQPage();
    const html = renderToString(ui as unknown as React.ReactElement);
    expect(html).toContain("Questions fréquentes");
    expect(html).toContain("Combien ça coûte");
  });
});
