/** @jest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ServiceOfferForm } from "@/app/dashboard/service-offers/service-offer-form";

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

const fillRequiredFields = () => {
  fireEvent.change(screen.getByPlaceholderText(/site-vitrine/i), {
    target: { value: "site-vitrine" },
  });
  fireEvent.change(screen.getByPlaceholderText(/Site vitrine clé en main/i), {
    target: { value: "Titre offre" },
  });
  fireEvent.change(screen.getByPlaceholderText(/Un site professionnel/i), {
    target: { value: "Sous titre" },
  });

  const textboxes = screen.getAllByRole("textbox");
  // 3: shortDescription, 4: longDescription, 5: targetAudience, 6: priceLabel, 7: duration, 8: engagement, 9: ctaLink, 10: ctaLabel, 11: features, 12: steps, 13: usecases
  fireEvent.change(textboxes[3], {
    target: { value: "Description courte ok" },
  });
  fireEvent.change(textboxes[4], {
    target: { value: "Description détaillée suffisamment longue" },
  });
  fireEvent.change(textboxes[5], { target: { value: "TPE" } });
  fireEvent.change(textboxes[6], { target: { value: "Sur devis" } });
  fireEvent.change(textboxes[7], { target: { value: "2 semaines" } });
  fireEvent.change(textboxes[8], { target: { value: "Forfait" } });
  fireEvent.change(textboxes[9], { target: { value: "/contact" } });
  fireEvent.change(textboxes[10], { target: { value: "Demander" } });
  fireEvent.change(textboxes[11], { target: { value: "Feature 1 | ⭐" } });
  fireEvent.change(textboxes[12], {
    target: { value: "Etape: Description" },
  });
  fireEvent.change(textboxes[13], { target: { value: "Cas: Description" } });
};

const availableOptions = [{ id: "opt-1", title: "Option 1", slug: "opt1" }];

describe("ServiceOfferForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true }) as unknown as typeof fetch;
  });

  it("soumet en création et redirige", async () => {
    render(
      <ServiceOfferForm mode="create" availableOptions={availableOptions} />,
    );

    fillRequiredFields();

    const optionCheckbox = screen
      .getByText(/option 1/i)
      .closest("label")!
      .querySelector("input") as HTMLInputElement;
    fireEvent.click(optionCheckbox);

    const submit = screen.getByRole("button", { name: /ajouter/i });
    await waitFor(() => expect(submit).not.toBeDisabled());
    fireEvent.click(submit);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/dashboard/service-offers",
        expect.objectContaining({ method: "POST" }),
      );
      const [, options] = (global.fetch as jest.Mock).mock.calls[0];
      const parsed = JSON.parse((options as RequestInit).body as string);
      expect(parsed.offerOptionIds).toContain("opt-1");
      expect(pushMock).toHaveBeenCalledWith("/dashboard/service-offers");
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("pré-remplit et soumet en édition", async () => {
    render(
      <ServiceOfferForm
        mode="edit"
        initialOffer={{
          id: "off-1",
          slug: "slug",
          title: "Titre existant",
          subtitle: "",
          shortDescription: "Description courte ok",
          longDescription: "Description détaillée suffisamment longue",
          targetAudience: "TPE",
          priceLabel: "Prix",
          durationLabel: "Durée",
          engagementLabel: "Engagement",
          isFeatured: false,
          order: 0,
          ctaLabel: "CTA",
          ctaLink: "/contact",
          features: [],
          steps: [],
          useCases: [],
          offerOptionIds: ["opt-1"],
        }}
        availableOptions={availableOptions}
      />,
    );

    expect(screen.getByDisplayValue("slug")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Site vitrine clé en main/i), {
      target: { value: "Titre modifié" },
    });

    const submit = screen.getByRole("button", { name: /mettre à jour/i });
    await waitFor(() => expect(submit).not.toBeDisabled());
    fireEvent.click(submit);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/dashboard/service-offers/off-1",
        expect.objectContaining({ method: "PUT" }),
      );
      expect(pushMock).toHaveBeenCalledWith("/dashboard/service-offers");
      expect(refreshMock).toHaveBeenCalled();
    });
  });
});
