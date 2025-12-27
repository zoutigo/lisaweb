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
      screen.getByRole("button", { name: /ouvrir le menu/i }),
    ).toBeVisible();
  });

  it("redirige vers la page d'accueil quand on clique sur le logo", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(
      screen.getByRole("button", { name: /retour à l'accueil/i }),
    );

    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("redirige vers /contact quand on clique sur le bouton", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /ouvrir le menu/i }));
    await user.click(screen.getByRole("button", { name: /me contacter/i }));
    expect(pushMock).toHaveBeenCalledWith("/contact");
  });

  it("ferme le menu quand on clique sur un lien du menu", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /ouvrir le menu/i }));
    expect(
      screen.getByRole("button", { name: /me contacter/i }),
    ).toBeInTheDocument();

    const menuLinks = screen.getAllByRole("link", { name: /nos offres/i });
    await user.click(menuLinks[menuLinks.length - 1]);
    expect(
      screen.queryByRole("button", { name: /me contacter/i }),
    ).not.toBeInTheDocument();
  });

  it("ferme le menu quand on clique en dehors", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /ouvrir le menu/i }));
    expect(
      screen.getByRole("button", { name: /me contacter/i }),
    ).toBeInTheDocument();

    await user.click(document.body);
    expect(
      screen.queryByRole("button", { name: /me contacter/i }),
    ).not.toBeInTheDocument();
  });

  it("change l'icône/label quand le menu est ouvert", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    const toggle = screen.getByRole("button", { name: /ouvrir le menu/i });
    expect(toggle).toBeInTheDocument();
    await user.click(toggle);
    expect(
      screen.getByRole("button", { name: /fermer le menu/i }),
    ).toBeInTheDocument();
  });
});
