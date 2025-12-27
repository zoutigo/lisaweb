/** @jest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import ServiceOffersLandingPage from "@/app/services-offers/page";
import { prisma } from "@/lib/prisma";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("@/lib/prisma", () => {
  const serviceOffer = { findMany: jest.fn() };
  return { __esModule: true, prisma: { serviceOffer } };
});

describe("Page /services-offers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("utilise react-query et affiche les offres", async () => {
    const sample = [
      {
        id: "id1",
        slug: "site-vitrine",
        title: "Site vitrine clé en main",
        subtitle: "",
        shortDescription: "Desc courte",
        targetAudience: "TPE",
        priceLabel: "Sur devis",
        durationLabel: "2 semaines",
        engagementLabel: "Forfait",
        ctaLabel: "Demander",
        ctaLink: "/contact",
        isFeatured: true,
        offerOptions: [
          { id: "opt1", title: "Opt 1", slug: "opt-1" },
          { id: "opt2", title: "Opt 2", slug: "opt-2" },
        ],
        features: [{ id: "f1", label: "Clé en main", icon: "✅" }],
        steps: [
          { id: "s1", title: "Analyse", description: "Comprendre", order: 0 },
        ],
        useCases: [],
      },
    ];
    (prisma.serviceOffer.findMany as jest.Mock).mockResolvedValue(sample);
    (global.fetch as unknown) = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(sample),
    });

    const ui = await ServiceOffersLandingPage();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /site vitrine clé en main/i }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: /Demander/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/opt 1/i)).toBeInTheDocument();
    expect(screen.getByText(/opt 2/i)).toBeInTheDocument();
    expect(screen.getByText(/mis en avant/i)).toBeInTheDocument();
    expect(screen.getByText(/options incluses/i)).toBeInTheDocument();
  });

  it("affiche les options issues du fallback initial si la requête échoue", async () => {
    const sample = [
      {
        id: "id1",
        slug: "site-vitrine",
        title: "Site vitrine clé en main",
        subtitle: "",
        shortDescription: "Desc courte",
        targetAudience: "TPE",
        priceLabel: "Sur devis",
        durationLabel: "2 semaines",
        engagementLabel: "Forfait",
        ctaLabel: "Demander",
        ctaLink: "/contact",
        isFeatured: true,
        offerOptions: [{ id: "opt3", title: "Fallback Opt", slug: "opt-3" }],
        features: [],
        steps: [],
        useCases: [],
      },
    ];
    (prisma.serviceOffer.findMany as jest.Mock).mockResolvedValue(sample);
    (global.fetch as unknown) = jest.fn().mockResolvedValue({
      ok: false,
    });

    const ui = await ServiceOffersLandingPage();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    );

    expect(
      screen.getByRole("heading", { name: /site vitrine clé en main/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/fallback opt/i)).toBeInTheDocument();
    expect(screen.getByText(/mis en avant/i)).toBeInTheDocument();
  });
});
