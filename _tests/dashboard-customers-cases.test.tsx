import { render, screen } from "@testing-library/react";
import CustomersCasesPage from "@/app/dashboard/customers-cases/page";
import { prisma } from "@/lib/prisma";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
  const customerCase = { findMany: jest.fn() };
  return { __esModule: true, prisma: { customerCase } };
});

describe("Dashboard customer cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin@x.com", isAdmin: true },
    });
  });

  it("liste les cas clients et permet ajout/modif/suppression", async () => {
    (prisma.customerCase.findMany as jest.Mock).mockResolvedValue([
      {
        id: "c1",
        title: "Titre",
        customer: "Client",
        description: "Desc",
        url: null,
        results: [{ id: "r1", label: "Résultat 1", slug: "res-1" }],
        imageUrl: "https://exemple.com/img.png",
        features: [{ id: "f1", label: "Feature", slug: "feat-1" }],
        createdAt: new Date(),
        isFeatured: false,
      },
    ]);

    const ui = await CustomersCasesPage();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    );

    expect(
      screen.getAllByRole("heading", { name: /cas clients/i }).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Titre").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /Nouveau cas client/i }),
    ).toBeInTheDocument();
  });
});
