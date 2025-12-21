import React from "react";
import { render, screen } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";

const redirectMock = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  redirect: (...args: unknown[]) => redirectMock(...args),
}));

const getServerSessionMock = jest.fn();
jest.mock("next-auth", () => ({
  __esModule: true,
  default: () => jest.fn(),
  getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

jest.mock("next/link", () => {
  const Link = ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  );
  Link.displayName = "LinkMock";
  return Link;
});

describe("Dashboard home page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("affiche les trois cartes principales avec leurs liens", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { email: "admin@site.com", isAdmin: true },
    });

    const ui = await DashboardPage();
    render(ui);

    expect(screen.getByText(/Espace administrateur/i)).toBeInTheDocument();

    const siteLink = screen.getByRole("link", { name: /Site/i });
    const usersLink = screen.getByRole("link", { name: /Utilisateurs/i });
    const partnersLink = screen.getByRole("link", { name: /Partenaires/i });

    expect(siteLink).toHaveAttribute("href", "/dashboard/site");
    expect(usersLink).toHaveAttribute("href", "/dashboard/users");
    expect(partnersLink).toHaveAttribute("href", "/dashboard/partners");
  });

  it("redirige lorsqu'aucune session admin n'est présente", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { email: "user@x.com", isAdmin: false },
    });
    redirectMock.mockImplementation(() => {
      throw new Error("redirect");
    });

    await expect(DashboardPage()).rejects.toThrow("redirect");
    expect(redirectMock).toHaveBeenCalledWith("/");
  });
});
