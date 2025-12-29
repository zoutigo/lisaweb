/** @jest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import OfferOptionsClient from "@/app/dashboard/offer-options/offer-options-client";

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

const options = [
  {
    id: "opt1",
    slug: "slug-1",
    title: "Titre 1",
    descriptionShort: "Desc 1",
    pricingType: "FIXED",
    priceCents: 10000,
    priceFromCents: null,
    unitLabel: null,
    unitPriceCents: null,
    durationDays: 2,
  },
  {
    id: "opt2",
    slug: "slug-2",
    title: "Titre 2",
    descriptionShort: "Desc 2",
    pricingType: "FROM",
    priceCents: null,
    priceFromCents: 20000,
    unitLabel: null,
    unitPriceCents: null,
    durationDays: 2,
  },
  {
    id: "opt3",
    slug: "slug-3",
    title: "Titre 3",
    descriptionShort: "Desc 3",
    pricingType: "PER_UNIT",
    priceCents: null,
    priceFromCents: null,
    unitLabel: "page",
    unitPriceCents: 1500,
    durationDays: 2,
  },
  {
    id: "opt4",
    slug: "slug-4",
    title: "Titre 4",
    descriptionShort: "Desc 4",
    pricingType: "QUOTE_ONLY",
    priceCents: null,
    priceFromCents: null,
    unitLabel: null,
    unitPriceCents: null,
    durationDays: 2,
  },
  {
    id: "opt5",
    slug: "slug-5",
    title: "Titre 5",
    descriptionShort: "Desc 5",
    pricingType: "FROM",
    priceCents: null,
    priceFromCents: 5000,
    unitLabel: null,
    unitPriceCents: null,
    durationDays: 2,
  },
  {
    id: "opt6",
    slug: "slug-6",
    title: "Titre 6",
    descriptionShort: "Desc 6",
    pricingType: "FIXED",
    priceCents: 6000,
    priceFromCents: null,
    unitLabel: null,
    unitPriceCents: null,
    durationDays: 2,
  },
  {
    id: "opt7",
    slug: "slug-7",
    title: "Titre 7",
    descriptionShort: "Desc 7",
    pricingType: "PER_UNIT",
    priceCents: null,
    priceFromCents: null,
    unitLabel: "mois",
    unitPriceCents: 3900,
    durationDays: 2,
  },
];

describe("OfferOptionsClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true }) as unknown as typeof fetch;
  });

  it("affiche les options avec pagination (6 par page)", () => {
    render(<OfferOptionsClient initialOptions={options} />);

    expect(screen.getByText(/slug-1/i)).toBeInTheDocument();
    expect(screen.getByText(/slug-6/i)).toBeInTheDocument();
    expect(screen.queryByText(/slug-7/i)).not.toBeInTheDocument();
    expect(screen.getByText(/afficher 1–6 sur 7/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));
    expect(screen.getByText(/slug-7/i)).toBeInTheDocument();
    expect(screen.getByText(/page 2 \/ 2/i)).toBeInTheDocument();
    expect(
      screen.getByText((text) => text.includes("€") && text.includes("mois")),
    ).toBeInTheDocument();
  });

  it("déclenche les actions voir/modifier/supprimer", async () => {
    render(<OfferOptionsClient initialOptions={[options[0]]} />);

    fireEvent.click(screen.getByRole("button", { name: /voir/i }));
    expect(pushMock).toHaveBeenCalledWith("/dashboard/offer-options/opt1");

    fireEvent.click(screen.getByRole("button", { name: /modifier/i }));
    expect(pushMock).toHaveBeenCalledWith("/dashboard/offer-options/opt1/edit");

    fireEvent.click(screen.getByRole("button", { name: /supprimer/i }));
    const [, confirmBtn] = await screen.findAllByRole("button", {
      name: /supprimer/i,
    });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/dashboard/offer-options/opt1",
        expect.objectContaining({ method: "DELETE" }),
      );
      expect(
        screen.queryByText(/slug-1/i, { exact: false }),
      ).not.toBeInTheDocument();
    });
  });
});
