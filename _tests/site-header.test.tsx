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

describe("SiteHeader", () => {
  beforeEach(() => {
    pushMock.mockClear();
    useSessionMock.mockReturnValue({ data: null });
  });

  it("affiche le logo et le bouton de prise de rendez-vous", () => {
    render(<SiteHeader />);

    expect(screen.getByAltText(/plisa/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /prendre un rendez-vous/i }),
    ).toBeInTheDocument();
  });

  it("redirige vers la page d'accueil quand on clique sur le logo", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(
      screen.getByRole("button", { name: /retour à l'accueil/i }),
    );

    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("redirige vers /rendezvous quand on clique sur le bouton", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(
      screen.getByRole("button", { name: /prendre un rendez-vous/i }),
    );

    expect(pushMock).toHaveBeenCalledWith("/rendezvous");
  });
});
