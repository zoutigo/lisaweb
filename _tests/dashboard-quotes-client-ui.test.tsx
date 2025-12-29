/** @jest-environment jsdom */

import { render, screen, within } from "@testing-library/react";
import QuotesClient from "@/app/dashboard/quotes/quotes-client";

const quotes = [
  {
    id: "q1",
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean@example.com",
    phone: "0600000000",
    projectDescription: "desc",
    serviceOffer: { title: "Offre A" },
    offerOptions: [{ id: "opt", title: "Option X" }],
    status: "NEW" as const,
    createdAt: new Date("2025-01-01"),
  },
];

describe("QuotesClient responsive UI", () => {
  it("affiche une carte mobile avec les actions en bas", () => {
    render(<QuotesClient initialQuotes={quotes} />);

    const card = screen.getByTestId("quote-card-mobile");
    const cardScope = within(card);

    expect(cardScope.getByText(/jean dupont/i)).toBeInTheDocument();
    // Status badge
    expect(cardScope.getByText(/nouveau/i)).toBeInTheDocument();
    // Actions: voir, modifier, supprimer
    expect(cardScope.getByRole("link", { name: /voir/i })).toHaveAttribute(
      "href",
      "/dashboard/quotes/q1",
    );
    expect(cardScope.getByRole("link", { name: /modifier/i })).toHaveAttribute(
      "href",
      "/dashboard/quotes/q1/edit",
    );
    expect(cardScope.getByRole("button", { name: /supprimer/i })).toBeEnabled();
    // Contact infos masquées dans la carte mobile
    expect(cardScope.queryByText(/jean@example.com/i)).not.toBeInTheDocument();
    expect(cardScope.queryByText(/0600000000/i)).not.toBeInTheDocument();
  });
});
