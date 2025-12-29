/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RealisationsClient from "@/app/realisations/realisations-client";

describe("RealisationsClient actions", () => {
  const initialCases = [
    {
      id: "c1",
      title: "Cas 1",
      customer: "Client",
      description: "Description",
      url: "https://exemple.com",
      imageUrl: undefined,
      results: [],
      features: [],
    },
  ];

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => initialCases,
    } as Response);
  });

  it("affiche les boutons Voir la réalisation et Discutons de votre projet", () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={client}>
        <RealisationsClient initialCases={initialCases} />
      </QueryClientProvider>,
    );

    const viewButton = screen.getByRole("button", {
      name: /voir la réalisation/i,
    });
    expect(viewButton).toBeInTheDocument();
    expect(viewButton.closest("a")).toHaveAttribute(
      "href",
      "https://exemple.com",
    );

    const discussButton = screen.getByRole("button", {
      name: /discutons de votre projet/i,
    });
    expect(discussButton).toBeInTheDocument();
    expect(discussButton.closest("a")).toHaveAttribute("href", "/rendezvous");
  });
});
