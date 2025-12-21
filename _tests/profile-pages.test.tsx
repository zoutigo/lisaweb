import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "@/app/profile/page";
import ProfileInfosPage from "@/app/profile/mes-infos/page";
import ProfileRdvPage from "@/app/profile/mes-rdv/page";

const redirectMock = jest.fn();
const pushMock = jest.fn();
const backMock = jest.fn();
jest.mock("next/navigation", () => ({
  __esModule: true,
  redirect: (...args: unknown[]) => redirectMock(...args),
  useRouter: () => ({
    push: pushMock,
    back: backMock,
    refresh: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

const getServerSessionMock = jest.fn();
jest.mock("next-auth", () => ({
  __esModule: true,
  default: () => jest.fn(),
  getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

jest.mock("@/lib/prisma", () => {
  const user = {
    findUnique: jest.fn(),
  };
  const rendezvous = {
    findMany: jest.fn(),
  };
  return { __esModule: true, prisma: { user, rendezvous } };
});

type PrismaMock = {
  user: { findUnique: jest.Mock };
  rendezvous: { findMany: jest.Mock };
};
const prismaMock = (jest.requireMock("@/lib/prisma") as { prisma: PrismaMock })
  .prisma;

describe("Pages profil", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSessionMock.mockResolvedValue({
      user: { id: "user-1", email: "user@example.com", isAdmin: false },
    });
    global.fetch = jest.fn();
  });

  it("affiche les liens principaux sur /profile", async () => {
    const ui = await ProfilePage();
    render(ui);
    expect(screen.getByText(/Espace personnel/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Mes infos/i })).toHaveAttribute(
      "href",
      "/profile/mes-infos",
    );
    expect(
      screen.getByRole("link", { name: /Mes rendez-vous/i }),
    ).toHaveAttribute("href", "/profile/mes-rdv");
  });

  it("affiche et met à jour mes informations sans pouvoir toucher à Admin", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      name: "Jane Doe",
      firstName: "Jane",
      lastName: "Doe",
      phone: "+33 6 12 34 56 78",
      email: "jane@example.com",
      isAdmin: false,
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "user-1",
          name: "Jane Updated",
          firstName: "Jane",
          lastName: "Doe",
          phone: "+33 6 12 34 56 78",
          email: "jane@example.com",
          isAdmin: false,
        }),
    });

    const ui = await ProfileInfosPage();
    render(ui);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Admin/i)).toBeNull();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Modifier/i }));
    expect(screen.getByDisplayValue("jane@example.com")).toBeDisabled();
    await user.clear(screen.getByPlaceholderText("Prénom"));
    await user.type(screen.getByPlaceholderText("Prénom"), "Jane");
    await user.clear(screen.getByPlaceholderText("Nom"));
    await user.type(screen.getByPlaceholderText("Nom"), "Doe");
    await user.clear(screen.getByPlaceholderText("Nom complet"));
    await user.type(screen.getByPlaceholderText("Nom complet"), "Jane Updated");
    await user.clear(screen.getByPlaceholderText("+33 6 12 34 56 78"));
    await user.type(
      screen.getByPlaceholderText("+33 6 12 34 56 78"),
      "+33612345678",
    );
    await user.click(screen.getByRole("button", { name: /Enregistrer/i }));

    await waitFor(() =>
      expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(0),
    );
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
      "/api/profile/me",
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Informations mises à jour/i),
      ).toBeInTheDocument(),
    );
  });

  it("liste et prépare l'édition d'un rendez-vous", async () => {
    prismaMock.rendezvous.findMany.mockResolvedValue([
      {
        id: 1,
        scheduledAt: new Date("2025-02-10T10:00:00Z"),
        reason: "Suivi projet",
        details: "Point d'avancement",
        status: "CONFIRMED",
        userId: "user-1",
      },
    ]);

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 1,
          date: "2025-02-10",
          time: "10:00",
          reason: "Suivi projet modifié",
          content: "Point d'avancement",
          status: "CONFIRMED",
        }),
    });

    const ui = await ProfileRdvPage();
    render(ui);

    expect(screen.getByText(/Suivi projet/i)).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: /Ouvrir le formulaire/i }),
    );
    await user.click(screen.getByRole("button", { name: /Modifier/i }));

    expect(
      (screen.getByPlaceholderText("Ex: Bilan de projet") as HTMLInputElement)
        .value,
    ).toBe("Suivi projet");

    await user.clear(screen.getByPlaceholderText("Ex: Bilan de projet"));
    await user.type(
      screen.getByPlaceholderText("Ex: Bilan de projet"),
      "Suivi projet modifié",
    );
    await user.click(screen.getByRole("button", { name: /Mettre à jour/i }));

    await waitFor(() =>
      expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
        "/api/profile/rendezvous/1",
      ),
    );
  });
});
