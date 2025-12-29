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

  it("rafraîchit avec une seconde réponse différente (pas de cache figé)", async () => {
    const first = [
      {
        id: "id1",
        slug: "site-vitrine",
        title: "Site vitrine A",
        subtitle: "",
        shortDescription: "Desc A",
        targetAudience: "TPE",
        priceLabel: "Sur devis",
        durationLabel: "2 semaines",
        engagementLabel: "Forfait",
        ctaLabel: "Demander",
        ctaLink: "/contact",
        isFeatured: true,
        offerOptions: [],
        features: [],
        steps: [],
        useCases: [],
      },
    ];
    const second = [
      {
        id: "id2",
        slug: "app-mobile",
        title: "Application mobile",
        subtitle: "",
        shortDescription: "Desc mobile",
        targetAudience: "Services",
        priceLabel: "À partir de 4500 €",
        durationLabel: "6 à 10 semaines",
        engagementLabel: "Forfait",
        ctaLabel: "Discuter",
        ctaLink: "/demande-devis",
        isFeatured: false,
        offerOptions: [],
        features: [],
        steps: [],
        useCases: [],
      },
    ];
    (prisma.serviceOffer.findMany as jest.Mock).mockResolvedValue(first);
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(first) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(second) });
    (global.fetch as unknown) = fetchMock;

    const ui = await ServiceOffersLandingPage();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText(/site vitrine a/i)).toBeInTheDocument(),
    );

    // force une mise à jour côté client
    queryClient.setQueryData(["service-offers"], second);
    render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    );
    await waitFor(() =>
      expect(screen.getByText(/application mobile/i)).toBeInTheDocument(),
    );
  });

  it("affiche les deux boutons d’action vers devis et rendez-vous", async () => {
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
        ctaLabel: "Demander un devis",
        ctaLink: "/contact",
        isFeatured: true,
        offerOptions: [],
        features: [],
        steps: [],
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

    const primary = screen.getByRole("button", { name: /demander un devis/i });
    const primaryLink = primary.closest("a");
    expect(primaryLink).toHaveAttribute("href", "/demande-devis");

    const secondary = screen.getByRole("button", {
      name: /prendre un rendez-vous/i,
    });
    const secondaryLink = secondary.closest("a");
    expect(secondaryLink).toHaveAttribute("href", "/rendezvous");
  });
});
