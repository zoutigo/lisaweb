/** @jest-environment jsdom */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ServiceOffersClient from "@/app/dashboard/service-offers/service-offers-client";

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

const baseOffers = [
  {
    id: "o1",
    slug: "site-vitrine",
    title: "Site vitrine",
    shortDescription: "Desc courte 1",
    featuresCount: 2,
  },
  {
    id: "o2",
    slug: "refonte",
    title: "Refonte",
    shortDescription: "Desc courte 2",
    featuresCount: 0,
  },
  {
    id: "o3",
    slug: "evolution",
    title: "Evolution",
    shortDescription: "Desc courte 3",
    featuresCount: 1,
  },
  {
    id: "o4",
    slug: "extra",
    title: "Extra",
    shortDescription: "Desc courte 4",
    featuresCount: 4,
  },
];

describe("ServiceOffersClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true }) as unknown as typeof fetch;
  });

  it("affiche les offres (3 par page) et la pagination", () => {
    render(<ServiceOffersClient initialOffers={baseOffers} />);

    expect(screen.getByText(/site-vitrine/i)).toBeInTheDocument();
    expect(screen.getAllByText(/refonte/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/evolution/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/extra/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/éléments/i).length).toBe(4);
  });

  it("déclenche les actions voir/modifier/supprimer", async () => {
    render(<ServiceOffersClient initialOffers={[baseOffers[0]]} />);

    fireEvent.click(screen.getByRole("button", { name: /voir/i }));
    expect(pushMock).toHaveBeenCalledWith("/dashboard/service-offers/o1");

    fireEvent.click(screen.getByRole("button", { name: /modifier/i }));
    expect(pushMock).toHaveBeenCalledWith("/dashboard/service-offers/o1/edit");

    fireEvent.click(screen.getByRole("button", { name: /supprimer/i }));
    const [, confirmBtn] = await screen.findAllByRole("button", {
      name: /supprimer/i,
    });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/dashboard/service-offers/o1",
        expect.objectContaining({ method: "DELETE" }),
      );
      expect(
        screen.queryByText(/site-vitrine/i, { exact: false }),
      ).not.toBeInTheDocument();
    });
  });
});
