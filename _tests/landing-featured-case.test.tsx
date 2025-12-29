/** @jest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LandingFeaturedCase } from "@/components/landing-featured-case";

describe("LandingFeaturedCase", () => {
  it("affiche les résultats et fonctionnalités de la fiche fournie", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const initialCase = {
      id: "case-1",
      title: "Un site moderne",
      customer: "Client A",
      description: "Description claire et complète",
      url: "https://exemple.com",
      imageUrl: "/images/st-augustin.png",
      results: [{ id: "r1", label: "Navigation simplifiée", slug: "nav" }],
      features: [{ id: "f1", label: "Design moderne", slug: "design" }],
    };

    render(
      <QueryClientProvider client={queryClient}>
        <LandingFeaturedCase initialCase={initialCase} />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText(/navigation simplifiée/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(/design moderne/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /voir la réalisation/i }),
    ).toHaveAttribute("href", "https://exemple.com");
  });

  it("rafraîchit avec le cas mis en avant renvoyé par l'API", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const originalFetch = global.fetch;
    (global as unknown as { fetch: jest.Mock }).fetch = jest
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          id: "case-2",
          title: "Cas API",
          customer: "Client B",
          description: "Desc API",
          url: "https://api-case.com",
          results: [{ id: "r1", label: "Résultat API", slug: "res-api" }],
          features: [{ id: "f1", label: "Feature API", slug: "feat-api" }],
        }),
      } as unknown as Response);

    render(
      <QueryClientProvider client={queryClient}>
        <LandingFeaturedCase initialCase={null} />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText(/résultat api/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(/cas api/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /voir la réalisation/i }),
    ).toHaveAttribute("href", "https://api-case.com");

    (global as unknown as { fetch: typeof fetch }).fetch = originalFetch;
  });

  it("affiche les fallbacks quand aucune donnée n'est liée", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <LandingFeaturedCase
          initialCase={{
            id: "case-2",
            title: "Sans données liées",
            description: "Desc",
            results: [],
            features: [],
          }}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        screen.getByText(/navigation simplifiée pour les parents/i),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText(/design moderne/i)).toBeInTheDocument();
  });
});
