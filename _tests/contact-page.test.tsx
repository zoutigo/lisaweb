/** @jest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ContactPage from "@/app/contact/page";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => {
  const siteInfo = { findFirst: jest.fn() };
  return { __esModule: true, prisma: { siteInfo } };
});

describe("Page /contact", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as unknown) = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          name: "LiSAWEB",
          email: "contact@lisaweb.fr",
          address: "89C rue du travail",
          city: "Pont de Cheruy",
          postalCode: "38230",
          country: "France",
          phone: "0650597839",
        }),
    });
  });

  it("affiche les infos de contact et la carte", async () => {
    (prisma.siteInfo.findFirst as jest.Mock).mockResolvedValue({
      name: "LiSAWEB",
      email: "contact@lisaweb.fr",
      address: "89C rue du travail",
      city: "Pont de Cheruy",
      postalCode: "38230",
      country: "France",
      phone: "0650597839",
    });
    const ui = await ContactPage();
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);

    expect(screen.getByText(/contact@lisaweb.fr/i)).toBeInTheDocument();
    expect(screen.getByText(/0650597839/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByTitle(/localisation/i) as HTMLIFrameElement,
      ).toBeInTheDocument(),
    );
  });

  it("valide le formulaire et désactive le bouton tant que non valide", async () => {
    (prisma.siteInfo.findFirst as jest.Mock).mockResolvedValue(null);
    const ui = await ContactPage();
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);

    const submit = screen.getByRole("button", { name: /envoyer/i });
    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/email/i), "user@test.com");
    await userEvent.type(screen.getByLabelText(/téléphone/i), "0600000000");
    await userEvent.type(screen.getByLabelText(/sujet/i), "Test message");
    await userEvent.type(
      screen.getByLabelText(/message/i),
      "Un message assez long",
    );
    const question = screen.getByLabelText("question-anti-robot");
    const text = question.textContent || "";
    const expected = parseInt(text.match(/(\d+)\s+\?/i)?.[1] || "0", 10);
    await userEvent.clear(screen.getByRole("spinbutton"));
    await userEvent.type(
      screen.getByRole("spinbutton"),
      String(expected + 3 - 3),
    ); // answer equals captchaExpected

    await waitFor(() => expect(submit).not.toBeDisabled());
  });
});
