import { render, screen, waitFor } from "@testing-library/react";
import UsersPage from "@/app/dashboard/users/page";
import UserViewPage from "@/app/dashboard/users/[id]/page";
import EditUserPage from "@/app/dashboard/users/[id]/edit/page";

const redirectMock = jest.fn();
const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  redirect: (...args: unknown[]) => redirectMock(...args),
  useParams: () => ({ id: "user-1" }),
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
  const prismaUser = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  };
  return { __esModule: true, prisma: { user: prismaUser } };
});
type PrismaUserMock = {
  findMany: jest.Mock;
  findUnique: jest.Mock;
  update: jest.Mock;
};
const prismaUserMock = (
  jest.requireMock("@/lib/prisma") as { prisma: { user: PrismaUserMock } }
).prisma.user;

describe("Dashboard users pages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin@x.com", isAdmin: true },
    });
  });

  it("affiche la liste des utilisateurs avec les infos clés", async () => {
    prismaUserMock.findMany.mockResolvedValue([
      {
        id: "user-1",
        firstName: "Anne",
        lastName: "Rousselot",
        name: "Anne ROUSSELOT",
        phone: "+33 6 12 34 56 78",
        email: "anne@example.com",
        isAdmin: true,
      },
    ]);

    const ui = await UsersPage();
    render(ui);

    expect(screen.getByText(/Utilisateurs/i)).toBeInTheDocument();
    expect(screen.getAllByText("Anne").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Rousselot").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Anne ROUSSELOT").length).toBeGreaterThan(0);
    expect(screen.getAllByText("+33 6 12 34 56 78").length).toBeGreaterThan(0);
    expect(screen.getAllByText("anne@example.com").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Admin$/i).length).toBeGreaterThan(0);
  });

  it("affiche la fiche utilisateur détaillée", async () => {
    prismaUserMock.findUnique.mockResolvedValue({
      id: "user-1",
      firstName: "Anne",
      lastName: "Rousselot",
      name: "Anne ROUSSELOT",
      phone: "+33 6 12 34 56 78",
      email: "anne@example.com",
      isAdmin: true,
    });

    const ui = await UserViewPage({
      params: { id: "user-1" },
    });
    render(ui);

    expect(screen.getByText("Anne ROUSSELOT")).toBeInTheDocument();
    expect(screen.getByText("Rousselot")).toBeInTheDocument();
    expect(screen.getByText("+33 6 12 34 56 78")).toBeInTheDocument();
    expect(screen.getByText("anne@example.com")).toBeInTheDocument();
    expect(screen.getByText(/Admin/i)).toBeInTheDocument();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("pré-remplit le formulaire d'édition et affiche les actions", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            firstName: "Anne",
            lastName: "Rousselot",
            name: "Anne ROUSSELOT",
            phone: "+33 6 12 34 56 78",
            email: "anne@example.com",
            isAdmin: true,
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

    render(<EditUserPage />);

    await waitFor(() =>
      expect(screen.getByDisplayValue("Anne ROUSSELOT")).toBeInTheDocument(),
    );

    expect(screen.getByPlaceholderText("Prénom")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nom")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nom complet")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Enregistrer/i }),
    ).toBeInTheDocument();
  });
});
