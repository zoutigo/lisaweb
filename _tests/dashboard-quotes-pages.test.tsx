/** @jest-environment jsdom */

import { render, screen, fireEvent } from "@testing-library/react";
import QuotesPage from "@/app/dashboard/quotes/page";
import QuoteDetailPage from "@/app/dashboard/quotes/[id]/page";
import QuoteEditPage from "@/app/dashboard/quotes/[id]/edit/page";

const redirectMock = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  redirect: (...args: unknown[]) => redirectMock(...args),
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
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
  const quoteRequest = { findMany: jest.fn(), findUnique: jest.fn() };
  const serviceOffer = { findMany: jest.fn() };
  const offerOption = { findMany: jest.fn() };
  return {
    __esModule: true,
    prisma: { quoteRequest, serviceOffer, offerOption },
  };
});

const prismaQuoteMock = jest.requireMock("@/lib/prisma").prisma
  .quoteRequest as {
  findMany: jest.Mock;
  findUnique: jest.Mock;
};
const prismaServiceOfferMock = jest.requireMock("@/lib/prisma").prisma
  .serviceOffer as { findMany: jest.Mock };
const prismaOptionMock = jest.requireMock("@/lib/prisma").prisma
  .offerOption as { findMany: jest.Mock };

describe("Dashboard quotes pages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin@x.com", isAdmin: true },
    });
  });

  it("affiche le bouton retour sur la liste", async () => {
    prismaQuoteMock.findMany.mockResolvedValue([
      {
        id: "q1",
        firstName: "Jean",
        lastName: "Dupont",
        email: "j@d.com",
        phone: "0600000000",
        projectDescription: "desc",
        serviceOffer: { title: "Offre A" },
        quoteOptions: [],
        status: "NEW",
        createdAt: new Date(),
      },
    ]);
    const ui = await QuotesPage();
    render(ui);

    const back = screen.getByRole("button", { name: /retour/i });
    expect(back.closest("a")).toHaveAttribute("href", "/dashboard");
  });

  it("affiche le bouton retour sur la fiche détail", async () => {
    prismaQuoteMock.findUnique.mockResolvedValue({
      id: "q2",
      firstName: "Anne",
      lastName: "Martin",
      email: "a@m.com",
      phone: null,
      projectDescription: "longue desc",
      desiredDeliveryDate: null,
      serviceOffer: {
        title: "Offre B",
        priceLabel: "900 €",
        durationDays: 12,
        offerOptions: [
          {
            id: "opt-included",
            title: "Option incluse",
            pricingType: "FIXED",
            priceCents: 0,
            priceFromCents: null,
            unitLabel: null,
            unitPriceCents: null,
            durationDays: 0,
          },
        ],
      },
      quoteOptions: [
        {
          quantity: 1,
          option: {
            id: "opt-extra",
            title: "Option extra",
            pricingType: "FIXED",
            priceCents: 45000,
            priceFromCents: null,
            unitLabel: null,
            unitPriceCents: null,
            durationDays: 4,
          },
        },
      ],
      status: "NEW",
      createdAt: new Date(),
      rendezvous: {
        id: "rdv-1",
        scheduledAt: new Date(),
        reason: "Echange",
        details: "Details",
      },
    });

    const ui = await QuoteDetailPage({ params: { id: "q2" } });
    render(ui);

    const back = screen.getByRole("button", { name: /retour/i });
    expect(back.closest("a")).toHaveAttribute("href", "/dashboard/quotes");
    expect(screen.getByText(/anne/i)).toBeInTheDocument();
    expect(screen.getByText(/offre b/i)).toBeInTheDocument();
    expect(screen.getAllByText(/900 €/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/option incluse/i)).toBeInTheDocument();
    expect(screen.getByText(/option extra/i)).toBeInTheDocument();
    expect(screen.getAllByText(/450 €/i).length).toBeGreaterThan(0);
    const synthese = screen.getByText(/synthèse des prix/i);
    expect(synthese).toBeInTheDocument();
    const formatLines = screen.getAllByText(/format/i);
    const formatLine = formatLines.find((el) =>
      el.parentElement?.className.includes("justify-between"),
    )!;
    expect(formatLine.nextSibling?.textContent).toMatch(/900 €/i);
    const optionsLine = screen
      .getAllByText(/options ponctuelles/i)
      .find((el) => el.parentElement?.className.includes("justify-between"))!;
    expect(optionsLine.nextSibling?.textContent).toMatch(/450/i);

    const editButtons = screen.getAllByRole("link", { name: /modifier/i });
    expect(editButtons[0]).toHaveAttribute("href", "/dashboard/quotes/q2/edit");
    expect(editButtons[0].className).toContain("bg-blue-600"); // primary tone
    const editRdv = screen.getByRole("link", {
      name: /modifier le rendez-vous/i,
    });
    expect(editRdv).toHaveAttribute("href", "/dashboard/rendezvous/rdv-1/edit");
    expect(editRdv.className).toContain("bg-blue-600");
  });

  it("affiche la page d'édition avec les bons liens", async () => {
    prismaQuoteMock.findUnique.mockResolvedValue({
      id: "q3",
      firstName: "Edit",
      lastName: "Page",
      email: "e@p.com",
      phone: null,
      projectDescription: "desc",
      desiredDeliveryDate: null,
      serviceOffer: {
        title: "Offre C",
        priceLabel: "1200 €",
        durationDays: 10,
        offerOptions: [],
      },
      quoteOptions: [],
      status: "NEW",
      createdAt: new Date(),
      rendezvous: null,
    });
    prismaServiceOfferMock.findMany.mockResolvedValue([
      { id: "so1", title: "Offre C", priceLabel: "1200 €", durationDays: 10 },
    ]);
    prismaOptionMock.findMany.mockResolvedValue([
      {
        id: "opt-x",
        title: "Opt X",
        pricingType: "FIXED",
        priceCents: 10000,
        priceFromCents: null,
        unitLabel: null,
        unitPriceCents: null,
        durationDays: 2,
      },
    ]);

    const ui = await QuoteEditPage({ params: { id: "q3" } });
    render(ui);

    expect(screen.getByText(/modifier le devis/i)).toBeInTheDocument();
    const viewBtn = screen.getByRole("link", { name: /voir/i });
    expect(viewBtn).toHaveAttribute("href", "/dashboard/quotes/q3");
    const backBtn = screen.getByRole("button", { name: /retour/i });
    expect(backBtn.closest("a")).toHaveAttribute("href", "/dashboard/quotes");
    expect(
      screen.getByRole("option", { name: /offre c/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/opt x/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mettre à jour/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/options incluses dans le format/i),
    ).toBeInTheDocument();
  });

  it("met à jour la synthèse quand on modifie options/format", async () => {
    prismaQuoteMock.findUnique.mockResolvedValue({
      id: "q4",
      firstName: "Edit",
      lastName: "Dyn",
      email: "dyn@x.com",
      phone: null,
      projectDescription: "desc",
      desiredDeliveryDate: null,
      serviceOfferId: "so1",
      serviceOffer: {
        title: "Offre D",
        priceLabel: "1500 €",
        durationDays: 5,
        offerOptions: [],
      },
      quoteOptions: [
        {
          quantity: 1,
          option: {
            id: "opt-y",
            title: "Opt Y",
            pricingType: "FIXED",
            priceCents: 5000,
            priceFromCents: null,
            unitLabel: null,
            unitPriceCents: null,
            durationDays: 2,
          },
        },
      ],
      status: "NEW",
      createdAt: new Date(),
      rendezvous: null,
    });
    prismaServiceOfferMock.findMany.mockResolvedValue([
      {
        id: "so1",
        title: "Offre D",
        priceLabel: "1500 €",
        durationDays: 5,
      },
      { id: "so2", title: "Offre E", priceLabel: "2000 €", durationDays: 7 },
    ]);
    prismaOptionMock.findMany.mockResolvedValue([
      {
        id: "opt-y",
        title: "Opt Y",
        pricingType: "FIXED",
        priceCents: 5000,
        priceFromCents: null,
        unitLabel: null,
        unitPriceCents: null,
        durationDays: 2,
      },
      {
        id: "opt-z",
        title: "Opt Z",
        pricingType: "PER_UNIT",
        priceCents: null,
        priceFromCents: null,
        unitLabel: "page",
        unitPriceCents: 2500,
        durationDays: 1,
      },
    ]);

    const ui = await QuoteEditPage({ params: { id: "q4" } });
    render(ui);

    expect(screen.getAllByText(/1500 €/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/50 €/i).length).toBeGreaterThan(0);

    const checkbox = screen.getByLabelText(/opt y/i);
    fireEvent.click(checkbox);
    const perUnit = screen.getByLabelText(/opt z/i);
    fireEvent.click(perUnit);
    const increment = screen
      .getAllByRole("button", { name: "+" })
      .find((btn) => btn.closest("label")?.textContent?.includes("Opt Z"))!;
    fireEvent.click(increment); // qty from 1 to 2

    expect(
      screen
        .getAllByText(/options ponctuelles/i)
        .find((el) => el.parentElement?.className.includes("justify-between"))
        ?.nextSibling?.textContent,
    ).toMatch(/50/i);
    expect(screen.getAllByText(/synthèse des délais/i).length).toBeGreaterThan(
      0,
    );

    fireEvent.change(screen.getByLabelText(/format choisi/i), {
      target: { value: "so2" },
    });
    expect(screen.getAllByText(/2000 €/i).length).toBeGreaterThan(0);
    expect(
      screen
        .getAllByText(/options ponctuelles/i)
        .find((el) => el.parentElement?.className.includes("justify-between"))
        ?.nextSibling?.textContent,
    ).toMatch(/50/i);
  });
});
