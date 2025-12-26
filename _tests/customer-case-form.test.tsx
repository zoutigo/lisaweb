/** @jest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CustomerCaseForm } from "@/app/dashboard/customers-cases/customer-case-form";

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

describe("CustomerCaseForm interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "new-id" }),
    }) as unknown as typeof fetch;
  });

  it("soumet un nouveau cas client (POST) et redirige", async () => {
    render(<CustomerCaseForm mode="create" />);

    fireEvent.change(screen.getByPlaceholderText(/Titre du cas client/i), {
      target: { value: "Nouveau cas client" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Décrivez le projet/i), {
      target: { value: "Description suffisamment longue" },
    });
    fireEvent.change(screen.getByPlaceholderText(/https:\/\/exemple.com/i), {
      target: { value: "https://exemple.com" },
    });

    const submitButton = screen.getByRole("button", { name: /Ajouter/i });
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/dashboard/customer-cases",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
      expect(pushMock).toHaveBeenCalledWith("/dashboard/customers-cases");
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("soumet une mise à jour (PUT) avec les valeurs initiales", async () => {
    const initialCase = {
      id: "case-123",
      title: "Titre initial",
      customer: "Client",
      description: "Une description assez longue",
      url: "https://exemple.com",
      imageUrl: "https://exemple.com/img.png",
      result1: "Résultat 1",
      feature1: "Feature 1",
      isOnLandingPage: true,
    };

    render(<CustomerCaseForm mode="edit" initialCase={initialCase} />);

    expect(screen.getByPlaceholderText(/Titre du cas client/i)).toHaveValue(
      "Titre initial",
    );
    fireEvent.change(screen.getByPlaceholderText(/Titre du cas client/i), {
      target: { value: "Titre modifié" },
    });

    const submitButton = screen.getByRole("button", {
      name: /Mettre à jour/i,
    });
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/dashboard/customer-cases/${initialCase.id}`,
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }),
      );
      expect(pushMock).toHaveBeenCalledWith("/dashboard/customers-cases");
      expect(refreshMock).toHaveBeenCalled();
    });
  });
});
