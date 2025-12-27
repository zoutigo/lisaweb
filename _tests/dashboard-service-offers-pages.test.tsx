/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import ServiceOfferDetailPage from "@/app/dashboard/service-offers/[id]/page";
import EditServiceOfferPage from "@/app/dashboard/service-offers/[id]/edit/page";
import NewServiceOfferPage from "@/app/dashboard/service-offers/new/page";

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
  const serviceOffer = { findUnique: jest.fn() };
  return { __esModule: true, prisma: { serviceOffer } };
});

const prismaMock = jest.requireMock("@/lib/prisma").prisma.serviceOffer as {
  findUnique: jest.Mock;
};

describe("Dashboard service offers pages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin@x.com", isAdmin: true },
    });
  });

  it("affiche la fiche détail", async () => {
    prismaMock.findUnique.mockResolvedValue({
      id: "s1",
      slug: "slug-1",
      title: "Titre 1",
      shortDescription: "Desc courte",
      longDescription: "Longue description",
      features: [{ id: "f1", label: "Feature", icon: null, order: 0 }],
      steps: [{ id: "st1", title: "Etape 1", description: "Desc", order: 0 }],
      useCases: [{ id: "u1", title: "Cas", description: "Usage" }],
    });

    const ui = await ServiceOfferDetailPage({ params: { id: "s1" } });
    render(ui);

    expect(screen.getByText(/titre 1/i)).toBeInTheDocument();
    expect(screen.getAllByText(/feature/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/etape 1/i)).toBeInTheDocument();
    expect(screen.getAllByText(/cas/i).length).toBeGreaterThan(0);
  });

  it("pré-remplit la page d'édition", async () => {
    prismaMock.findUnique.mockResolvedValue({
      id: "s2",
      slug: "slug-2",
      title: "Titre 2",
      shortDescription: "Desc courte",
      longDescription: "Longue description",
      features: [],
      steps: [],
      useCases: [],
    });

    const ui = await EditServiceOfferPage({ params: { id: "s2" } });
    render(ui);

    expect(screen.getByDisplayValue("slug-2")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mettre à jour/i }),
    ).toBeInTheDocument();
  });

  it("affiche la page de création", async () => {
    const ui = await NewServiceOfferPage();
    render(ui);

    expect(
      screen.getByRole("heading", { name: /ajouter une offre/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ajouter/i }),
    ).toBeInTheDocument();
  });
});
