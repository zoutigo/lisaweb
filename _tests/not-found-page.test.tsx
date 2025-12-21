import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotFound from "@/app/not-found";

const backMock = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    back: backMock,
  }),
}));

describe("404 not-found page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("affiche le contenu principal de la page 404", () => {
    render(<NotFound />);

    expect(screen.getByText(/Erreur 404/i)).toBeInTheDocument();
    expect(screen.getByText(/Page introuvable/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Le chemin que vous cherchez n'existe pas/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /Retour à l'accueil/i }),
    ).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("link", { name: /Aller au dashboard/i }),
    ).toHaveAttribute("href", "/dashboard");
    expect(
      screen.getByRole("button", { name: /Revenir en arrière/i }),
    ).toBeInTheDocument();
  });

  it("déclenche un retour arrière via le bouton d'action", async () => {
    const user = userEvent.setup();
    render(<NotFound />);

    await user.click(
      screen.getByRole("button", { name: /Revenir en arrière/i }),
    );
    expect(backMock).toHaveBeenCalledTimes(1);
  });
});
