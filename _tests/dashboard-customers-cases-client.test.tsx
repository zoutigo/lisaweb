/** @jest-environment jsdom */

import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import CustomersCasesClient from "@/app/dashboard/customers-cases/customers-cases-client";

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

const baseCase = {
  id: "c-1",
  title: "Un cas client",
  customer: "Client A",
  description: "Une description très complète",
  url: "https://exemple.com",
  createdAt: new Date("2024-01-01").toISOString(),
};

describe("CustomersCasesClient actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true }) as unknown as typeof fetch;
  });

  it("affiche les boutons et liens d'action", () => {
    render(<CustomersCasesClient initialCases={[baseCase]} />);

    expect(
      screen.getByRole("button", { name: /nouveau cas client/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /voir/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /modifier/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /supprimer/i }),
    ).toBeInTheDocument();
  });

  it("navigue correctement sur voir, modifier, ajouter et supprime un cas", async () => {
    render(<CustomersCasesClient initialCases={[baseCase]} />);

    fireEvent.click(
      screen.getByRole("button", { name: /nouveau cas client/i }),
    );
    expect(pushMock).toHaveBeenCalledWith("/dashboard/customers-cases/new");

    fireEvent.click(screen.getByRole("button", { name: /voir/i }));
    expect(pushMock).toHaveBeenCalledWith(
      `/dashboard/customers-cases/${baseCase.id}`,
    );

    fireEvent.click(screen.getByRole("button", { name: /modifier/i }));
    expect(pushMock).toHaveBeenCalledWith(
      `/dashboard/customers-cases/${baseCase.id}/edit`,
    );

    fireEvent.click(screen.getByRole("button", { name: /supprimer/i }));
    const [, confirmButton] = await screen.findAllByRole("button", {
      name: /supprimer/i,
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/dashboard/customer-cases/${baseCase.id}`,
        expect.objectContaining({ method: "DELETE" }),
      );
      expect(
        screen.queryByText(baseCase.title, { exact: true }),
      ).not.toBeInTheDocument();
      expect(screen.getByText(/cas client supprimé/i)).toBeInTheDocument();
    });
  });
});
