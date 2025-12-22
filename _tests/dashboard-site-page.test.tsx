import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SiteAdminPage from "@/app/dashboard/site/page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const redirectMock = jest.fn();
jest.mock("next/navigation", () => ({
  __esModule: true,
  redirect: (...args: unknown[]) => redirectMock(...args),
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
  }),
}));

jest.mock("next-auth", () => ({
  __esModule: true,
  default: () => jest.fn(),
  getServerSession: () =>
    Promise.resolve({ user: { email: "admin@x.com", isAdmin: true } }),
}));

describe("Dashboard site page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("affiche les infos en mode lecture puis permet d'éditer et sauvegarder", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient();
    global.fetch = jest
      .fn()
      // initial GET
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            name: "Mon Site",
            email: "contact@site.com",
            address: "1 rue",
            city: "Paris",
            postalCode: "75000",
            country: "France",
            phone: "+33123456789",
          }),
      })
      // PUT
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

    render(
      <QueryClientProvider client={queryClient}>
        <SiteAdminPage />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText("Mon Site")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: /modifier/i }));

    await user.clear(screen.getByPlaceholderText("Nom du site"));
    await user.type(screen.getByPlaceholderText("Nom du site"), "Nouveau");

    await user.click(screen.getByRole("button", { name: /Enregistrer/i }));

    expect((global.fetch as jest.Mock).mock.calls[1][0]).toBe(
      "/api/dashboard/site",
    );
  });
});
