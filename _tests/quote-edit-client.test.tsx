/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { QuoteEditClient } from "@/app/dashboard/quotes/quote-edit-client";

describe("QuoteEditClient synthèses", () => {
  it("affiche les synthèses prix et délais", () => {
    render(
      <QuoteEditClient
        quote={{
          id: "q-edit",
          projectDescription: "desc",
          serviceOfferId: "so1",
          options: [
            {
              id: "opt1",
              title: "Opt1",
              pricingType: "FIXED",
              priceCents: 20000,
              priceFromCents: null,
              unitLabel: null,
              unitPriceCents: null,
              durationDays: 3,
              quantity: 2,
            },
          ],
          status: "NEW",
        }}
        offers={[
          {
            id: "so1",
            title: "Offre 1",
            priceLabel: "1000 €",
            durationDays: 8,
            includedOptionIds: [],
          },
        ]}
        options={[
          {
            id: "opt1",
            title: "Opt1",
            pricingType: "FIXED",
            priceCents: 20000,
            priceFromCents: null,
            unitLabel: null,
            unitPriceCents: null,
            durationDays: 3,
          },
        ]}
      />,
    );

    expect(screen.getByText(/synthèse des prix/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1000 €/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/400 €/i).length).toBeGreaterThan(0);

    expect(screen.getByText(/synthèse des délais/i)).toBeInTheDocument();
    expect(screen.getByText(/8 j/i)).toBeInTheDocument();
    expect(screen.getByText(/6 j/i)).toBeInTheDocument(); // 2 x 3j
    expect(screen.getByText(/14 j/i)).toBeInTheDocument();
  });
});
