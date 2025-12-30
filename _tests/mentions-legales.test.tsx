/** @jest-environment jsdom */

import { act, render, screen } from "@testing-library/react";
import MentionsLegalesPage from "@/app/mentions-legales/page";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: { siteInfo: { findFirst: jest.fn().mockResolvedValue(null) } },
}));

describe("Page /mentions-legales", () => {
  it("affiche les sections principales", async () => {
    const ui = await MentionsLegalesPage();
    await act(async () => {
      render(ui);
    });

    expect(
      screen.getByRole("heading", { name: /mentions légales/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/LISAWEB/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/o2switch/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Propriété intellectuelle/i)).toBeInTheDocument();
    expect(screen.getByText(/Données personnelles/i)).toBeInTheDocument();
  });

  it("contient l'email de contact", async () => {
    const ui = await MentionsLegalesPage();
    await act(async () => {
      render(ui);
    });
    expect(
      screen.getAllByText(/contact@valerymbele.fr/i).length,
    ).toBeGreaterThan(0);
  });

  it("affiche les données de siteInfo quand elles existent", async () => {
    const mockSiteInfo = {
      name: "Mon Agence",
      email: "hello@agence.fr",
      phone: "+33102030405",
      address: "12 rue des Lilas",
      city: "Lyon",
      postalCode: "69000",
      country: "France",
      siret: "111 222 333 00011",
      codeApe: "6202A",
      statut: "SAS",
      responsable: "Jane Doe",
    };
    (prisma.siteInfo.findFirst as unknown as jest.Mock).mockResolvedValueOnce(
      mockSiteInfo,
    );

    const ui = await MentionsLegalesPage();
    await act(async () => {
      render(ui);
    });

    expect(screen.getByText(/Mon Agence/)).toBeInTheDocument();
    expect(screen.getAllByText(/hello@agence.fr/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/SAS/)).toBeInTheDocument();
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
  });
});
