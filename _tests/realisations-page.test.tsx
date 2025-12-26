/** @jest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RealisationsPage from "@/app/realisations/page";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => {
  const customerCase = { findMany: jest.fn() };
  return { __esModule: true, prisma: { customerCase } };
});

describe("Page /realisations", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("affiche la liste des cas clients", async () => {
    (prisma.customerCase.findMany as jest.Mock).mockResolvedValue([
      {
        id: "1",
        title: "Site vitrine moderne",
        customer: "École locale",
        description: "Refonte complète du site",
        url: "https://example.com",
        imageUrl: "/test.png",
        result1: "Navigation simplifiée",
        feature1: "Mobile first",
        createdAt: new Date("2024-01-01"),
      },
    ]);

    (global.fetch as unknown) = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: "1",
            title: "Site vitrine moderne",
            customer: "École locale",
            description: "Refonte complète du site",
            url: "https://example.com",
            imageUrl: "/test.png",
            result1: "Navigation simplifiée",
            feature1: "Mobile first",
          },
        ]),
    });

    const ui = await RealisationsPage();
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);

    await waitFor(() =>
      expect(screen.getByText(/Site vitrine moderne/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(/École locale/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /voir la réalisation/i }),
    ).toBeInTheDocument();
  });
});
