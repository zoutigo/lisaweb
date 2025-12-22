/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import MethodePage from "@/app/methode/page";

jest.mock("next/link", () => {
  const Link = ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  );
  Link.displayName = "LinkMock";
  return Link;
});

describe("Page /methode", () => {
  it("affiche le titre principal et le sous-texte agile", () => {
    render(<MethodePage />);

    expect(
      screen.getByRole("heading", { name: /Ma méthode de travail/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/approche inspirée de l’agile, sans jargon inutile/i),
    ).toBeInTheDocument();
  });

  it("présente les étapes clés du projet web", () => {
    render(<MethodePage />);

    const steps = [
      /Analyse du besoin/i,
      /Structure & expérience utilisateur/i,
      /Développement agile/i,
      /Mise en ligne & optimisation/i,
      /Suivi & évolutions/i,
    ];

    steps.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("met en avant la stack et les bénéfices", () => {
    render(<MethodePage />);

    expect(
      screen.getByText(/Une stack moderne, fiable et durable/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Ce que ma méthode vous apporte/i),
    ).toBeInTheDocument();
  });

  it("contient les liens d'appel à l'action principaux", () => {
    render(<MethodePage />);

    const ctas = screen.getAllByRole("link", {
      name: /Discutons de votre projet/i,
    });
    ctas.forEach((link) => expect(link).toHaveAttribute("href", "/rendezvous"));

    expect(
      screen.getByRole("link", { name: /Retour à l’accueil/i }),
    ).toHaveAttribute("href", "/");
  });
});
