/** @jest-environment jsdom */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import QuotesClient from "@/app/dashboard/quotes/quotes-client";

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const quote = {
  id: "q1",
  firstName: "Valery",
  lastName: "Mbele",
  email: "zoutigo@gmail.com",
  phone: "0600000000",
  projectDescription: "desc",
  serviceOffer: { title: "Offre A" },
  offerOptions: [],
  status: "NEW" as const,
  createdAt: new Date("2025-12-28"),
};

describe("QuotesClient delete flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
  });

  it("ferme la modale après confirmation et retire le devis", async () => {
    render(<QuotesClient initialQuotes={[quote]} />);

    const deleteButtons = screen.getAllByRole("button", { name: /supprimer/i });
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByText(/supprimer ce devis/i)).toBeInTheDocument();

    // The last "Supprimer" is in the modal
    const modalDelete = screen
      .getAllByRole("button", { name: /supprimer/i })
      .at(-1)!;
    fireEvent.click(modalDelete);

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/dashboard/quotes/q1",
        expect.any(Object),
      ),
    );
    await waitFor(() =>
      expect(screen.queryByText(/supprimer ce devis/i)).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/devis supprimé/i)).toBeInTheDocument();
  });
});
