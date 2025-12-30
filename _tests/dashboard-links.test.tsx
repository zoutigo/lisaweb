import { render, screen } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";

const redirectMock = jest.fn();
jest.mock("@/lib/prisma", () => ({ prisma: {} }));
jest.mock("next/navigation", () => ({
  __esModule: true,
  redirect: (...args: unknown[]) => redirectMock(...args),
}));

jest.mock("next-auth", () => {
  const mockGetSession = jest.fn();
  const mockNextAuth = jest.fn();
  return {
    __esModule: true,
    default: (...args: unknown[]) => mockNextAuth(...args),
    getServerSession: (...args: unknown[]) => mockGetSession(...args),
    __mocked: { mockGetSession, mockNextAuth },
  };
});

const authModule = jest.requireMock("next-auth") as {
  __mocked: {
    mockGetSession: jest.Mock;
    mockNextAuth: jest.Mock;
  };
};

describe("Dashboard links", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authModule.__mocked.mockGetSession.mockResolvedValue({
      user: { email: "admin@example.com", isAdmin: true },
    });
  });

  it("affiche tous les liens du dashboard avec les bonnes cibles", async () => {
    const ui = await DashboardPage();
    render(ui);

    const hrefs = screen
      .getAllByRole("link")
      .map((el) => el.getAttribute("href"))
      .filter(Boolean);

    expect(hrefs).toContain("/dashboard/site");
    expect(hrefs).toContain("/dashboard/users");
    expect(hrefs).toContain("/dashboard/partners");
    expect(hrefs).toContain("/dashboard/faq");
    expect(hrefs).toContain("/dashboard/customers-cases");
    expect(hrefs).toContain("/dashboard/service-offers");
    expect(hrefs).toContain("/dashboard/offer-options");
    expect(hrefs).toContain("/dashboard/rendezvous");
  });
});
