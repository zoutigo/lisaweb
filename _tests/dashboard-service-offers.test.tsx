import { render, screen } from "@testing-library/react";
import ServiceOffersPage from "@/app/dashboard/service-offers/page";
import { prisma } from "@/lib/prisma";

const redirectMock = jest.fn();
const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  redirect: (...args: unknown[]) => redirectMock(...args),
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
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
  const serviceOffer = { findMany: jest.fn() };
  return { __esModule: true, prisma: { serviceOffer } };
});

describe("Dashboard service offers page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin@x.com", isAdmin: true },
    });
  });

  it("affiche les offres et les actions", async () => {
    (prisma.serviceOffer.findMany as jest.Mock).mockResolvedValue([
      {
        id: "id1",
        slug: "site-vitrine",
        title: "Site vitrine clé en main",
        shortDescription: "Desc courte",
        features: [{ id: "f1" }],
        order: 1,
      },
    ]);

    const ui = await ServiceOffersPage();
    render(ui);

    expect(
      screen.getByRole("heading", { name: /services/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/site-vitrine/i)).toBeInTheDocument();
    expect(screen.getByText(/desc courte/i)).toBeInTheDocument();
    expect(screen.getByText(/1 éléments/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Nouvelle offre/i }),
    ).toBeInTheDocument();
  });
});
