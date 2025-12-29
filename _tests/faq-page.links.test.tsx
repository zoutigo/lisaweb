/** @jest-environment jsdom */

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

import { render, screen } from "@testing-library/react";
import React from "react";
import FAQPage from "@/app/faq/page";

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

describe("Page /faq liens et CTA", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.faqCategory.count.mockResolvedValue(1);
    prismaMock.faqCategory.findMany.mockResolvedValue([
      { id: "cat1", name: "Général", order: 1 },
    ]);
    prismaMock.faq.findMany.mockResolvedValue([]);
  });

  it("les boutons pointent vers les bonnes pages", async () => {
    const ui = await FAQPage();
    render(ui as unknown as React.ReactElement);

    expect(
      screen.getByRole("link", { name: /poser une question/i }),
    ).toHaveAttribute("href", "/faq#questions");
    expect(
      screen.getAllByRole("link", { name: /voir ma méthode/i })[0],
    ).toHaveAttribute("href", "/methode");
    expect(
      screen.getByRole("link", { name: /prendre un rendez-vous/i }),
    ).toHaveAttribute("href", "/rendezvous");
  });
});
