/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import OfferOptionDetailPage from "@/app/dashboard/offer-options/[id]/page";
import EditOfferOptionPage from "@/app/dashboard/offer-options/[id]/edit/page";
import NewOfferOptionPage from "@/app/dashboard/offer-options/new/page";

const redirectMock = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  redirect: (...args: unknown[]) => redirectMock(...args),
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

const getServerSessionMock = jest.fn();
jest.mock("next-auth", () => ({
  __esModule: true,
  default: () => jest.fn(),
  getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
  useSession: () => ({
    data: { user: { isAdmin: true, email: "admin@x.com" } },
  }),
}));

jest.mock("@/lib/prisma", () => {
  const offerOption = { findUnique: jest.fn() };
  return { __esModule: true, prisma: { offerOption } };
});

const prismaMock = jest.requireMock("@/lib/prisma").prisma.offerOption as {
  findUnique: jest.Mock;
};

describe("Dashboard offer options pages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin@x.com", isAdmin: true },
    });
  });

  it("affiche la fiche détail", async () => {
    prismaMock.findUnique.mockResolvedValue({
      id: "opt-1",
      slug: "option-1",
      title: "Option 1",
      descriptionShort: "Courte description",
      descriptionLong: "Longue description suffisamment étoffée",
      pricingType: "FIXED",
      priceCents: 5000,
      priceFromCents: null,
      unitLabel: null,
      unitPriceCents: null,
      isPopular: false,
      order: 1,
      constraintsJson: '{"dependsOn":["site"]}',
    });

    const ui = await OfferOptionDetailPage({ params: { id: "opt-1" } });
    render(ui);

    expect(screen.getByText(/option 1/i)).toBeInTheDocument();
    expect(screen.getByText(/option-1/i)).toBeInTheDocument();
    expect(screen.getByText(/prix: 5000/i)).toBeInTheDocument();
    expect(screen.getByText(/contraintes/i)).toBeInTheDocument();
  });

  it("pré-remplit la page d'édition", async () => {
    prismaMock.findUnique.mockResolvedValue({
      id: "opt-2",
      slug: "option-2",
      title: "Option 2",
      descriptionShort: "Courte description",
      descriptionLong: "Longue description suffisamment étoffée",
      pricingType: "QUOTE_ONLY",
      priceCents: null,
      priceFromCents: null,
      unitLabel: null,
      unitPriceCents: null,
      isPopular: true,
      order: 2,
      constraintsJson: null,
    });

    const ui = await EditOfferOptionPage({ params: { id: "opt-2" } });
    render(ui);

    expect(screen.getByDisplayValue("option-2")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mettre à jour/i }),
    ).toBeInTheDocument();
  });

  it("affiche la page de création", async () => {
    const ui = await NewOfferOptionPage();
    render(ui);

    expect(
      screen.getByRole("heading", { name: /ajouter une option d'offre/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ajouter/i }),
    ).toBeInTheDocument();
  });
});
