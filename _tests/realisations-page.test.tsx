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
        results: [{ id: "r1", label: "Navigation simplifiée", slug: "nav" }],
        features: [{ id: "f1", label: "Mobile first", slug: "mobile" }],
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
            results: [
              { id: "r1", label: "Navigation simplifiée", slug: "nav" },
            ],
            features: [{ id: "f1", label: "Mobile first", slug: "mobile" }],
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
    expect(prisma.customerCase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true } }),
    );
  });

  it("rafraîchit avec de nouvelles données (pas de cache figé)", async () => {
    (prisma.customerCase.findMany as jest.Mock).mockResolvedValue([
      {
        id: "1",
        title: "Case initial",
        customer: "Client A",
        description: "Desc A",
        url: null,
        imageUrl: null,
        results: [],
        features: [],
        createdAt: new Date("2024-01-01"),
      },
    ]);

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: "1",
              title: "Case initial",
              customer: "Client A",
              description: "Desc A",
              url: null,
              imageUrl: null,
              results: [],
              features: [],
            },
          ]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: "2",
              title: "Case rafraîchi",
              customer: "Client B",
              description: "Desc B",
              url: null,
              imageUrl: null,
              results: [],
              features: [],
            },
          ]),
      });
    (global.fetch as unknown) = fetchMock;

    const ui = await RealisationsPage();
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);

    await waitFor(() =>
      expect(screen.getByText(/case initial/i)).toBeInTheDocument(),
    );

    // force un update de la query
    qc.setQueryData(
      ["customer-cases-public"],
      [
        {
          id: "2",
          title: "Case rafraîchi",
          customer: "Client B",
          description: "Desc B",
          url: null,
          imageUrl: null,
          results: [],
          features: [],
        },
      ],
    );
    render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);

    await waitFor(() =>
      expect(screen.getByText(/case rafraîchi/i)).toBeInTheDocument(),
    );
  });
});
