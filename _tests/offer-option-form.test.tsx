/** @jest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { OfferOptionForm } from "@/app/dashboard/offer-options/offer-option-form";

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

const fillBaseFields = () => {
  fireEvent.change(screen.getByPlaceholderText(/boutique-en-ligne/i), {
    target: { value: "option-a" },
  });
  fireEvent.change(screen.getByPlaceholderText(/boutique en ligne/i), {
    target: { value: "Option A" },
  });

  const textareas = screen
    .getAllByRole("textbox")
    .filter((el) => el.tagName === "TEXTAREA");

  fireEvent.change(textareas[0], {
    target: { value: "Description courte valide" },
  });
  fireEvent.change(textareas[1], {
    target: { value: "Description longue suffisamment détaillée pour valider" },
  });
  fireEvent.change(textareas[2], {
    target: { value: '{"dependsOn":[]}' },
  });
};

describe("OfferOptionForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true }) as unknown as typeof fetch;
  });

  it("soumet en création (prix sur devis)", async () => {
    render(<OfferOptionForm mode="create" />);

    fillBaseFields();

    const submit = screen.getByRole("button", { name: /ajouter/i });
    await waitFor(() => expect(submit).not.toBeDisabled());
    fireEvent.click(submit);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/dashboard/offer-options",
        expect.objectContaining({ method: "POST" }),
      );
      expect(pushMock).toHaveBeenCalledWith("/dashboard/offer-options");
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("gère les champs conditionnels et soumet en édition", async () => {
    render(
      <OfferOptionForm
        mode="edit"
        initialOption={{
          id: "opt-1",
          slug: "option-a",
          title: "Option A",
          descriptionShort: "Description courte valide",
          descriptionLong:
            "Description longue suffisamment détaillée pour valider",
          pricingType: "FROM",
          priceFromCents: 12000,
          isPopular: true,
          order: 1,
          priceCents: undefined,
          unitLabel: undefined,
          unitPriceCents: undefined,
          constraintsJson: undefined,
        }}
      />,
    );

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "PER_UNIT" } });

    const textareas = screen
      .getAllByRole("textbox")
      .filter((el) => el.tagName === "TEXTAREA");
    fireEvent.change(textareas[0], {
      target: { value: "Description courte modifiée" },
    });
    fireEvent.change(textareas[1], {
      target: {
        value: "Description longue modifiée et toujours suffisamment détaillée",
      },
    });

    fireEvent.change(screen.getByPlaceholderText(/produit, page, langue/i), {
      target: { value: "page" },
    });

    const spinbuttons = screen.getAllByRole("spinbutton");
    const unitPriceInput = spinbuttons[spinbuttons.length - 1];
    fireEvent.change(unitPriceInput, { target: { value: "1500" } });

    const submit = screen.getByRole("button", { name: /mettre à jour/i });
    await waitFor(() => expect(submit).not.toBeDisabled());
    fireEvent.click(submit);

    await waitFor(() => {
      const [, options] = (global.fetch as jest.Mock).mock.calls[0];
      const parsed = JSON.parse((options as RequestInit).body as string);
      expect(parsed.pricingType).toBe("PER_UNIT");
      expect(parsed.unitLabel).toBe("page");
      expect(parsed.unitPriceCents).toBe(1500);
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/dashboard/offer-options/opt-1",
        expect.objectContaining({ method: "PUT" }),
      );
    });
  });
});
