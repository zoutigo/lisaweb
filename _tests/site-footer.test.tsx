/* eslint-disable @next/next/no-img-element */
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SiteFooter } from "@/components/site-footer";
import React from "react";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...rest }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...rest} />
  ),
}));

describe("SiteFooter partners", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("affiche les liens de navigation attendus", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null),
    }) as unknown as typeof fetch;

    render(
      <QueryClientProvider client={queryClient}>
        <SiteFooter />
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Nos offres/i)).toHaveAttribute(
      "href",
      "/services-offers",
    );
    expect(screen.getByText(/Méthode/i)).toHaveAttribute("href", "/methode");
    expect(screen.getByText(/FAQ/i)).toHaveAttribute("href", "/faq");
    // logo cliquable
    const logoLink = screen.getByRole("link", { name: /plisa/i });
    expect(logoLink).toHaveAttribute("href", "/");
  });

  it("affiche les logos partenaires avec leur lien", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const fetchMock = jest
      .fn()
      // first call: site info
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            email: "contact@test.com",
            phone: "0102030405",
            address: "1 rue Centrale",
            postalCode: "75001",
            city: "Paris",
            country: "France",
          }),
      })
      // second call: partners
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: 1,
              name: "ACME",
              logoUrl: "/files/acme.png",
              url: "https://acme.test",
            },
            { id: 2, name: "NoLogo", logoUrl: null, url: null },
          ]),
      });

    global.fetch = fetchMock as unknown as typeof fetch;

    render(
      <QueryClientProvider client={queryClient}>
        <SiteFooter />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByAltText("ACME")).toBeInTheDocument();
    });

    const acmeLink = screen.getByLabelText("ACME");
    expect(acmeLink).toHaveAttribute("href", "https://acme.test");
    expect(screen.getByAltText("ACME")).toHaveAttribute(
      "src",
      "/files/acme.png",
    );

    expect(screen.getByText("1 rue Centrale")).toBeInTheDocument();
    expect(screen.getByText("75001 Paris")).toBeInTheDocument();
    expect(screen.getByText("France")).toBeInTheDocument();

    const fallbackImg = screen.getByAltText("NoLogo");
    expect(fallbackImg.getAttribute("src")).toContain(
      "partner-placeholder.svg",
    );

    expect(fetchMock).toHaveBeenCalledWith("/api/site-info", {
      cache: "no-store",
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/partners", {
      cache: "no-store",
    });
  });
});
