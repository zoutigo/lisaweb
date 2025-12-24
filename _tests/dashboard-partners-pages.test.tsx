import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PartnersPage from "@/app/dashboard/partners/page";
import PartnerViewPage from "@/app/dashboard/partners/[id]/page";
import EditPartnerPage from "@/app/dashboard/partners/[id]/edit/page";
import NewPartnerPage from "@/app/dashboard/partners/new/page";

const redirectMock = jest.fn();
const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  redirect: (...args: unknown[]) => redirectMock(...args),
  useParams: () => ({ id: "1" }),
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
  const partner = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  };
  return { __esModule: true, prisma: { partner } };
});
type PrismaPartnerMock = {
  findMany: jest.Mock;
  findUnique: jest.Mock;
};
const prismaPartner = (
  jest.requireMock("@/lib/prisma") as { prisma: { partner: PrismaPartnerMock } }
).prisma.partner;

describe("Dashboard partners pages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin@x.com", isAdmin: true },
    });
  });

  it("affiche la liste des partenaires avec placeholder", async () => {
    prismaPartner.findMany.mockResolvedValue([
      {
        id: 1,
        name: "ACME",
        url: "https://acme.test",
        logoUrl: null,
        createdAt: new Date(),
      },
    ]);
    const ui = await PartnersPage();
    render(ui);

    expect(screen.getByText(/Partenaires/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Créer un partenaire/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retour/i })).toBeInTheDocument();
    const imgs = screen.getAllByRole("img");
    expect(imgs[0].getAttribute("src")).toContain("partner-placeholder.svg");
    expect(screen.getAllByText("ACME").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Page 1/).length).toBeGreaterThan(0);
  });

  it("affiche la fiche partenaire avec logo ou placeholder", async () => {
    const logo = "/files/logo.png";
    prismaPartner.findUnique.mockResolvedValue({
      id: 1,
      name: "ACME",
      url: "https://acme.test",
      logoUrl: logo,
      createdAt: new Date(),
    });
    const ui = await PartnerViewPage({ params: { id: "1" } });
    render(ui);

    expect(screen.getAllByText("ACME").length).toBeGreaterThan(0);
    const img = screen.getAllByRole("img", { name: /ACME/i })[0];
    expect(img.getAttribute("src")).toContain("logo.png");
  });

  it("pré-remplit le formulaire d'édition, prévisualise le logo et envoie les données", async () => {
    const user = userEvent.setup();
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            name: "ACME",
            url: "https://acme.test",
            logoUrl: "/files/logo.png",
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ path: "/files/new.png" }),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    render(<EditPartnerPage />);

    await waitFor(() =>
      expect(screen.getByDisplayValue("ACME")).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("img", { name: /Logo preview/i }).getAttribute("src"),
    ).toContain("logo.png");

    const fileInput = screen.getByLabelText(/Logo/i) as HTMLInputElement;
    const file = new File(["data"], "new.png", { type: "image/png" });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: /Enregistrer/i }));

    expect((global.fetch as jest.Mock).mock.calls[1][0]).toBe(
      "/api/files/upload",
    );
    expect((global.fetch as jest.Mock).mock.calls[2][0]).toBe(
      "/api/dashboard/partners/1",
    );
  });

  it("permet de supprimer depuis la liste avec le bouton ActionIconButton", async () => {
    prismaPartner.findMany.mockResolvedValue([
      {
        id: 1,
        name: "ACME",
        url: "https://acme.test",
        logoUrl: null,
        createdAt: new Date(),
      },
    ]);
    const user = userEvent.setup();
    global.confirm = jest.fn(() => true);
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, json: () => ({}) } as Response);

    const ui = await PartnersPage();
    render(ui);

    const deleteBtns = screen.getAllByRole("button", { name: /supprimer/i });
    expect(deleteBtns.length).toBeGreaterThan(0);
    await user.click(deleteBtns[0]);

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith("/api/dashboard/partners/1", {
        method: "DELETE",
      }),
    );
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
  });

  it("crée un partenaire avec upload logo et bouton désactivé si invalide", async () => {
    const user = userEvent.setup();
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ path: "/files/logo.png" }),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    render(<NewPartnerPage />);

    expect(screen.getByRole("button", { name: /Créer/ })).toBeDisabled();

    await user.type(screen.getByPlaceholderText("Nom du partenaire"), "ACME");
    await user.type(
      screen.getByPlaceholderText("https://exemple.com"),
      "https://acme.test",
    );

    const fileInput = screen.getByLabelText(/Logo/i) as HTMLInputElement;
    const file = new File(["data"], "logo.png", { type: "image/png" });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: /Créer/ }));

    expect((global.fetch as jest.Mock).mock.calls[1][0]).toBe(
      "/api/dashboard/partners",
    );
  });
});
