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
  const customerCaseResult = { findMany: jest.fn() };
  const customerCaseFeature = { findMany: jest.fn() };
  return {
    __esModule: true,
    prisma: { customerCase, customerCaseResult, customerCaseFeature },
  };
});

const prismaMock = jest.requireMock("@/lib/prisma").prisma.customerCase as {
  findUnique: jest.Mock;
};
const prismaResultMock = jest.requireMock("@/lib/prisma").prisma
  .customerCaseResult as {
  findMany: jest.Mock;
};
const prismaFeatureMock = jest.requireMock("@/lib/prisma").prisma
  .customerCaseFeature as {
  findMany: jest.Mock;
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
      results: [{ id: "r1", label: "Résultat 1", slug: "res-1" }],
      features: [{ id: "f1", label: "Feature 1", slug: "feat-1" }],
      createdAt: new Date(),
      isFeatured: false,
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
      results: [],
      features: [],
      isFeatured: false,
      createdAt: new Date(),
    });
    prismaResultMock.findMany.mockResolvedValue([]);
    prismaFeatureMock.findMany.mockResolvedValue([]);

    const ui = await EditCustomerCasePage({ params: { id: "case-2" } });
    render(ui);

    expect(screen.getByDisplayValue("Titre existant")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mettre à jour/i }),
    ).toBeInTheDocument();
  });

  it("affiche la page de création avec le formulaire", async () => {
    prismaResultMock.findMany.mockResolvedValue([]);
    prismaFeatureMock.findMany.mockResolvedValue([]);
    const ui = await NewCustomerCasePage();
    render(ui);

    expect(
      screen.getByRole("heading", { name: /ajouter un cas client/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /ajouter/i })[2],
    ).toBeDefined();
  });
});
