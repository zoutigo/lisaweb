/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "@/app/page";

jest.mock("@/lib/prisma", () => {
  const customerCase = {
    findFirst: jest.fn().mockResolvedValue(null),
  };
  const serviceOffer = {
    findFirst: jest.fn().mockResolvedValue(null),
  };
  return {
    prisma: {
      customerCase,
      serviceOffer,
    },
  };
});

describe("Landing internal links", () => {
  it("pointe les CTA vers des pages existantes", async () => {
    const ui = await Home();
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);

    // CTA secteurs
    const contactLink = screen.getByRole("link", { name: /me contacter/i });
    expect(contactLink).toHaveAttribute("href", "/contact");

    // CTA format (bloc service offer)
    expect(
      screen.getByRole("link", { name: /demander un devis gratuit/i }),
    ).toHaveAttribute("href", "/demande-devis");
  });
});
