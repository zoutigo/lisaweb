/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import QuotesClient from "@/app/dashboard/quotes/quotes-client";

const mockQuotes = [
  {
    id: "q1",
    firstName: "Jean",
    lastName: "Dupont",
    email: "j@d.com",
    phone: "0600000000",
    projectDescription: "desc",
    serviceOffer: { title: "Offre A" },
    offerOptions: [{ id: "opt1", title: "Option 1" }],
    status: "NEW" as const,
    createdAt: new Date(),
  },
];

describe("QuotesClient links and actions", () => {
  it("affiche les boutons avec les bons liens", () => {
    render(<QuotesClient initialQuotes={mockQuotes} />);

    const viewLink = screen.getAllByRole("link", { name: /voir/i })[0];
    expect(viewLink).toHaveAttribute("href", "/dashboard/quotes/q1");

    const editLink = screen.getAllByRole("link", { name: /modifier/i })[0];
    expect(editLink).toHaveAttribute("href", "/dashboard/quotes/q1/edit");

    const deleteBtn = screen.getAllByRole("button", { name: /supprimer/i })[0];
    expect(deleteBtn).toBeInTheDocument();
  });
});
