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
