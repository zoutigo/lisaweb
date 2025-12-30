/** @jest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    render(
      <CustomerCaseForm
        mode="create"
        availableResults={[{ id: "r1", label: "Result A", slug: "result-a" }]}
        availableFeatures={[
          { id: "f1", label: "Feature A", slug: "feature-a" },
        ]}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/Titre du cas client/i), {
      target: { value: "Nouveau cas client" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Décrivez le projet/i), {
      target: { value: "Description suffisamment longue" },
    });
    fireEvent.change(screen.getByPlaceholderText(/https:\/\/exemple.com/i), {
      target: { value: "https://exemple.com" },
    });

    // select existing options
    const combos = screen.getAllByRole("combobox");
    fireEvent.change(combos[0], { target: { value: "result-a" } });
    fireEvent.change(combos[1], { target: { value: "feature-a" } });

    // add custom
    const customResultInput = screen.getByPlaceholderText(
      /Ajouter un nouveau résultat/i,
    );
    fireEvent.change(customResultInput, { target: { value: "Result Custom" } });
    fireEvent.keyDown(customResultInput, { key: "Enter", code: "Enter" });

    const customFeatureInput = screen.getByPlaceholderText(
      /Ajouter une caractéristique/i,
    );
    fireEvent.change(customFeatureInput, {
      target: { value: "Feature Custom" },
    });
    fireEvent.keyDown(customFeatureInput, { key: "Enter", code: "Enter" });

    // add another feature via button to ensure click works
    fireEvent.change(customFeatureInput, {
      target: { value: "Feature Button" },
    });
    fireEvent.click(screen.getByTestId("add-feature-btn"));

    const submitButton = screen.getAllByRole("button", {
      name: /Ajouter/i,
    })[2];
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
      const body = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body as string,
      );
      expect(body.results.length).toBeGreaterThan(0);
      expect(body.features.length).toBeGreaterThan(0);
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
      results: [{ label: "Résultat 1", slug: "res-1" }],
      features: [{ label: "Feature 1", slug: "feat-1" }],
      isActive: true,
      isFeatured: true,
    };

    render(
      <CustomerCaseForm
        mode="edit"
        initialCase={initialCase}
        availableResults={[{ id: "r1", label: "Résultat 1", slug: "res-1" }]}
        availableFeatures={[{ id: "f1", label: "Feature 1", slug: "feat-1" }]}
      />,
    );

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

  it("rend le bouton Mettre à jour actif avec des valeurs valides préremplies", async () => {
    render(
      <CustomerCaseForm
        mode="edit"
        initialCase={{
          id: "case-999",
          title: "Titre ok",
          description: "Description assez longue",
          customer: "Client",
          url: "https://exemple.com",
          imageUrl: "",
          results: [{ label: "R1", slug: "r1" }],
          features: [{ label: "F1", slug: "f1" }],
          isActive: true,
          isFeatured: false,
        }}
        availableResults={[]}
        availableFeatures={[]}
      />,
    );

    const submitButton = await screen.findByRole("button", {
      name: /Mettre à jour/i,
    });
    await waitFor(() => expect(submitButton).not.toBeDisabled());
  });

  it("affiche la case Actif cochée par défaut et peut la décocher", async () => {
    const user = userEvent.setup();
    render(
      <CustomerCaseForm
        mode="create"
        availableResults={[]}
        availableFeatures={[]}
      />,
    );

    const activeCheckbox = screen.getByLabelText(
      /afficher sur la page réalisations/i,
    );
    expect(activeCheckbox).toBeChecked();
    await user.click(activeCheckbox);
    expect(activeCheckbox).not.toBeChecked();
  });
});
