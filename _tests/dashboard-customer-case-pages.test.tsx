/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import CustomerCaseDetailPage from "@/app/dashboard/customers-cases/[id]/page";
import EditCustomerCasePage from "@/app/dashboard/customers-cases/[id]/edit/page";
import NewCustomerCasePage from "@/app/dashboard/customers-cases/new/page";

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
  const customerCase = { findUnique: jest.fn() };
  return { __esModule: true, prisma: { customerCase } };
});

const prismaMock = jest.requireMock("@/lib/prisma").prisma.customerCase as {
  findUnique: jest.Mock;
};

describe("Pages dashboard/customers-cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin@x.com", isAdmin: true },
    });
  });

  it("affiche la fiche détail avec ses actions", async () => {
    prismaMock.findUnique.mockResolvedValue({
      id: "case-1",
      title: "Cas test",
      customer: "Client A",
      description: "Description complète",
      url: "https://exemple.com",
      imageUrl: null,
      result1: "Résultat 1",
      feature1: "Feature 1",
      createdAt: new Date(),
      isOnLandingPage: false,
    });

    const ui = await CustomerCaseDetailPage({ params: { id: "case-1" } });
    render(ui);

    expect(screen.getByText(/Cas test/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /modifier/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /https:\/\/exemple.com/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Résultat 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Feature 1/i)).toBeInTheDocument();
  });

  it("pré-remplit le formulaire en édition", async () => {
    prismaMock.findUnique.mockResolvedValue({
      id: "case-2",
      title: "Titre existant",
      customer: "Client B",
      description: "Une description existante",
      url: null,
      imageUrl: null,
      result1: null,
      result2: null,
      result3: null,
      result4: null,
      result5: null,
      feature1: null,
      feature2: null,
      feature3: null,
      feature4: null,
      feature5: null,
      isOnLandingPage: false,
      createdAt: new Date(),
    });

    const ui = await EditCustomerCasePage({ params: { id: "case-2" } });
    render(ui);

    expect(screen.getByDisplayValue("Titre existant")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mettre à jour/i }),
    ).toBeInTheDocument();
  });

  it("affiche la page de création avec le formulaire", async () => {
    const ui = await NewCustomerCasePage();
    render(ui);

    expect(
      screen.getByRole("heading", { name: /ajouter un cas client/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ajouter/i }),
    ).toBeInTheDocument();
  });
});
