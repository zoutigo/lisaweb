/** @jest-environment jsdom */

import { act, render, screen } from "@testing-library/react";
import PrivacyPolicyPage from "@/app/politique-confidentialite/page";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: { siteInfo: { findFirst: jest.fn().mockResolvedValue(null) } },
}));

describe("Page /politique-confidentialite", () => {
  it("affiche les sections principales et le fallback", async () => {
    const ui = await PrivacyPolicyPage();
    await act(async () => {
      render(ui);
    });

    expect(
      screen.getByRole("heading", { name: /Politique de confidentialité/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Responsable du traitement/i)).toBeInTheDocument();
    expect(
      screen.getAllByText(/contact@valerymbele.fr/i).length,
    ).toBeGreaterThan(0);
  });

  it("utilise les données de siteInfo quand disponibles", async () => {
    const mockSiteInfo = {
      name: "Agence Demo",
      email: "priv@agence.fr",
      phone: "+33102030405",
      address: "12 rue des Lilas",
      city: "Lyon",
      postalCode: "69000",
      country: "France",
      siret: "11122233300011",
      codeApe: "6202A",
      statut: "SAS",
      responsable: "Jane Doe",
    };
    (prisma.siteInfo.findFirst as unknown as jest.Mock).mockResolvedValueOnce(
      mockSiteInfo,
    );

    const ui = await PrivacyPolicyPage();
    await act(async () => {
      render(ui);
    });

    expect(screen.getAllByText(/priv@agence.fr/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Jane Doe/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/SAS/)).toBeInTheDocument();
  });
});
