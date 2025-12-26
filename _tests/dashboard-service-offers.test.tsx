import { render, screen } from "@testing-library/react";
import ServiceOffersPage from "@/app/dashboard/service-offers/page";
import { prisma } from "@/lib/prisma";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const redirectMock = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  redirect: (...args: unknown[]) => redirectMock(...args),
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
        subtitle: "",
        shortDescription: "Desc courte",
        longDescription: "Une longue description",
        targetAudience: "TPE",
        priceLabel: "Sur devis",
        durationLabel: "2 semaines",
        engagementLabel: "Forfait",
        isFeatured: true,
        order: 1,
        ctaLabel: "CTA",
        ctaLink: "/contact",
        features: [],
        steps: [],
        useCases: [],
      },
    ]);

    const ui = await ServiceOffersPage();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    );

    expect(
      screen.getByRole("heading", { name: /services/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/site vitrine clé en main/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Nouvelle offre/i }),
    ).toBeInTheDocument();
  });
});
