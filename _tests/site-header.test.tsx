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

  it("affiche le logo et le menu", () => {
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

  it("affiche les liens principaux dans le menu", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /ouvrir le menu/i }));
    const contactLink = screen.getAllByRole("link", { name: /contact/i })[0];
    const faqLink = screen.getAllByRole("link", { name: /faq/i })[0];
    expect(contactLink).toHaveAttribute("href", "/contact");
    expect(faqLink).toHaveAttribute("href", "/faq");
  });

  it("ferme le menu quand on clique sur un lien du menu", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /ouvrir le menu/i }));
    expect(
      screen.getAllByRole("link", { name: /nos offres/i })[0],
    ).toBeInTheDocument();

    const menuLinks = screen.getAllByRole("link", { name: /nos offres/i });
    await user.click(menuLinks[menuLinks.length - 1]);
    expect(
      screen.queryByRole("button", { name: /fermer le menu/i }),
    ).not.toBeInTheDocument();
  });

  it("ferme le menu quand on clique en dehors", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /ouvrir le menu/i }));
    expect(
      screen.getAllByRole("link", { name: /nos offres/i })[0],
    ).toBeInTheDocument();

    await user.click(document.body);
    expect(
      screen.queryByRole("button", { name: /fermer le menu/i }),
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
