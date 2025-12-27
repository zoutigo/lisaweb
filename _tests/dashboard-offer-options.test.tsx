import { render, screen } from "@testing-library/react";
import OfferOptionsPage from "@/app/dashboard/offer-options/page";
import { prisma } from "@/lib/prisma";

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
  const offerOption = { findMany: jest.fn() };
  return { __esModule: true, prisma: { offerOption } };
});

describe("Dashboard offer options page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin@x.com", isAdmin: true },
    });
  });

  it("affiche les options et les actions", async () => {
    (prisma.offerOption.findMany as jest.Mock).mockResolvedValue([
      {
        id: "opt1",
        slug: "boutique",
        title: "Boutique",
        descriptionShort: "Desc courte",
        pricingType: "FIXED",
        priceCents: 10000,
        priceFromCents: null,
        unitLabel: null,
        unitPriceCents: null,
        order: 1,
      },
    ]);

    const ui = await OfferOptionsPage();
    render(ui);

    expect(
      screen.getByRole("heading", { name: /modules et options/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/boutique/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/desc courte/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /nouvelle option/i }),
    ).toBeInTheDocument();
  });
});
