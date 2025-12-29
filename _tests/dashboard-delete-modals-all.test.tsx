/** @jest-environment jsdom */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CustomersCasesClient from "@/app/dashboard/customers-cases/customers-cases-client";
import FaqClient from "@/app/dashboard/faq/faq-client";
import OfferOptionsClient from "@/app/dashboard/offer-options/offer-options-client";
import { PartnersClient } from "@/app/dashboard/partners/partners-client";
import { PartnerActions } from "@/app/dashboard/partners/[id]/actions";
import QuotesClient from "@/app/dashboard/quotes/quotes-client";
import { RendezvousClient } from "@/app/dashboard/rendezvous/rendezvous-client";
import ServiceOffersClient from "@/app/dashboard/service-offers/service-offers-client";
import { UserActions } from "@/app/dashboard/users/[id]/actions";

const push = jest.fn();
const refresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const selectConfirmButton = () =>
  screen.getAllByRole("button", { name: /supprimer/i }).slice(-1)[0];

beforeEach(() => {
  jest.clearAllMocks();
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
});

describe("ConfirmModal delete flows across dashboard lists", () => {
  it("service offers list uses a confirm modal that closes after delete", async () => {
    render(
      <ServiceOffersClient
        initialOffers={[
          {
            id: "so1",
            slug: "offer-1",
            title: "Offre 1",
            shortDescription: "Desc",
            featuresCount: 2,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /supprimer/i }));
    expect(screen.getByText(/supprimer cette offre/i)).toBeInTheDocument();

    fireEvent.click(selectConfirmButton());

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/dashboard/service-offers/so1",
        expect.any(Object),
      ),
    );
    await waitFor(() =>
      expect(
        screen.queryByText(/supprimer cette offre/i),
      ).not.toBeInTheDocument(),
    );
  });

  it("offer options list uses confirm modal and closes on delete", async () => {
    render(
      <OfferOptionsClient
        initialOptions={[
          {
            id: "opt1",
            slug: "option-1",
            title: "Option 1",
            descriptionShort: "Desc",
            pricingType: "FIXED",
            priceCents: 1000,
            priceFromCents: null,
            unitLabel: null,
            unitPriceCents: null,
            durationDays: 2,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /supprimer/i }));
    expect(screen.getByText(/supprimer cette option/i)).toBeInTheDocument();

    fireEvent.click(selectConfirmButton());

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/dashboard/offer-options/opt1",
        expect.any(Object),
      ),
    );
    await waitFor(() =>
      expect(
        screen.queryByText(/supprimer cette option/i),
      ).not.toBeInTheDocument(),
    );
  });

  it("customer cases list uses confirm modal and closes on delete", async () => {
    render(
      <CustomersCasesClient
        initialCases={[
          {
            id: "cc1",
            title: "Cas 1",
            description: "Desc",
            customer: "Client",
            createdAt: new Date().toISOString(),
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /supprimer/i }));
    expect(screen.getByText(/supprimer ce cas client/i)).toBeInTheDocument();

    fireEvent.click(selectConfirmButton());

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/dashboard/customer-cases/cc1",
        expect.any(Object),
      ),
    );
    await waitFor(() =>
      expect(
        screen.queryByText(/supprimer ce cas client/i),
      ).not.toBeInTheDocument(),
    );
  });

  it("partners list uses confirm modal and closes on delete", async () => {
    render(
      <PartnersClient
        partners={[
          {
            id: "p1",
            name: "Partner",
            logoUrl: null,
            url: "https://exemple.com",
            createdAt: new Date().toISOString(),
          },
        ]}
        placeholderLogo="/placeholder.png"
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: /supprimer/i })[0]);
    expect(screen.getByText(/supprimer ce partenaire/i)).toBeInTheDocument();

    fireEvent.click(selectConfirmButton());

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/dashboard/partners/p1",
        expect.any(Object),
      ),
    );
    await waitFor(() =>
      expect(
        screen.queryByText(/supprimer ce partenaire/i),
      ).not.toBeInTheDocument(),
    );
  });

  it("quotes list confirm modal closes after delete", async () => {
    render(
      <QuotesClient
        initialQuotes={[
          {
            id: "q1",
            firstName: "Valery",
            lastName: "Mbele",
            email: "zoutigo@gmail.com",
            phone: "0600000000",
            projectDescription: "desc",
            serviceOffer: { title: "Offre A" },
            offerOptions: [],
            status: "NEW" as const,
            createdAt: new Date("2025-12-28"),
          },
        ]}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: /supprimer/i })[0]);
    expect(screen.getByText(/supprimer ce devis/i)).toBeInTheDocument();

    fireEvent.click(selectConfirmButton());

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/dashboard/quotes/q1",
        expect.any(Object),
      ),
    );
    await waitFor(() =>
      expect(screen.queryByText(/supprimer ce devis/i)).not.toBeInTheDocument(),
    );
  });

  it("faq list confirm modal closes after delete", async () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <FaqClient
          initialFaqs={[
            {
              id: "faq1",
              question: "Q",
              answer: "A",
              createdAt: new Date().toISOString(),
              categoryId: "cat1",
            },
          ]}
          categories={[{ id: "cat1", name: "Cat 1", order: 1 }]}
        />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /supprimer/i }));
    expect(screen.getByText(/supprimer la question/i)).toBeInTheDocument();

    fireEvent.click(selectConfirmButton());

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/dashboard/faq/faq1",
        expect.any(Object),
      ),
    );
    await waitFor(() =>
      expect(
        screen.queryByText(/supprimer la question/i),
      ).not.toBeInTheDocument(),
    );
  });

  it("rendezvous list confirm modal closes after delete", async () => {
    render(
      <RendezvousClient
        rendezvous={[
          {
            id: "rdv1",
            date: "2030-01-01",
            time: "10:00",
            reason: "Echange",
            content: "Contenu",
            status: "PENDING",
            userName: "John Doe",
            userEmail: "john@example.com",
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /supprimer/i }));
    expect(screen.getByText(/supprimer le rendez-vous/i)).toBeInTheDocument();

    fireEvent.click(selectConfirmButton());

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/dashboard/rendezvous/rdv1",
        expect.any(Object),
      ),
    );
    await waitFor(() =>
      expect(
        screen.queryByText(/supprimer le rendez-vous/i),
      ).not.toBeInTheDocument(),
    );
  });
});

describe("ConfirmModal delete flows on detail action bars", () => {
  it("user actions confirm modal closes after delete", async () => {
    render(<UserActions userId="u1" />);

    fireEvent.click(screen.getByRole("button", { name: /supprimer/i }));
    expect(screen.getByText(/supprimer cet utilisateur/i)).toBeInTheDocument();

    fireEvent.click(selectConfirmButton());

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/dashboard/users/u1",
        expect.any(Object),
      ),
    );
    await waitFor(() =>
      expect(
        screen.queryByText(/supprimer cet utilisateur/i),
      ).not.toBeInTheDocument(),
    );
  });

  it("partner actions confirm modal closes after delete", async () => {
    render(<PartnerActions partnerId="p2" />);

    fireEvent.click(screen.getByRole("button", { name: /supprimer/i }));
    expect(screen.getByText(/supprimer ce partenaire/i)).toBeInTheDocument();

    fireEvent.click(selectConfirmButton());

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/dashboard/partners/p2",
        expect.any(Object),
      ),
    );
    await waitFor(() =>
      expect(
        screen.queryByText(/supprimer ce partenaire/i),
      ).not.toBeInTheDocument(),
    );
  });
});
