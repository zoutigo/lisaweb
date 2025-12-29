import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SiteHeader } from "@/components/site-header";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: pushMock,
  }),
  usePathname: () => "/",
  useSearchParams: () => ({
    get: () => null,
  }),
}));

const useSessionMock = jest.fn();
jest.mock("next-auth/react", () => ({
  __esModule: true,
  useSession: () => useSessionMock(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

describe("SiteHeader admin visibility", () => {
  beforeEach(() => {
    pushMock.mockClear();
    // reset fetch mock
    global.fetch = jest.fn(
      async () =>
        new Response(JSON.stringify({ isAdmin: false }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );
  });

  it("does not show Dashboard when not authenticated", async () => {
    useSessionMock.mockReturnValue({ data: null });
    render(<SiteHeader />);

    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: /ouvrir le menu utilisateur/i }),
    );

    expect(screen.queryByRole("button", { name: /dashboard/i })).toBeNull();
  });

  it("does not show Dashboard when authenticated but not admin", async () => {
    useSessionMock.mockReturnValue({
      data: { user: { name: "User", email: "u@example.com" } },
    });
    // mock non-admin response
    global.fetch = jest.fn(
      async () =>
        new Response(JSON.stringify({ isAdmin: false }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );

    render(<SiteHeader />);
    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: /ouvrir le menu utilisateur/i }),
    );

    expect(screen.queryByRole("button", { name: /dashboard/i })).toBeNull();
  });

  it("shows Dashboard for admin and navigates to /dashboard when clicked", async () => {
    useSessionMock.mockReturnValue({
      data: { user: { name: "Admin", email: "a@example.com", isAdmin: true } },
    });
    // mock admin response
    global.fetch = jest.fn(
      async () =>
        new Response(JSON.stringify({ isAdmin: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );

    render(<SiteHeader />);
    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: /ouvrir le menu utilisateur/i }),
    );

    const dash = screen.getByRole("button", { name: /dashboard/i });
    expect(dash).toBeInTheDocument();

    await user.click(dash);
    expect(pushMock).toHaveBeenCalledWith("/dashboard");
  });
});
