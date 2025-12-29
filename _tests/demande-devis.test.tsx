/** @jest-environment jsdom */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import QuoteWizard, {
  QuoteWizardOption,
} from "@/app/demande-devis/quote-wizard";

const offers = [
  {
    id: "offer1",
    title: "Offre A",
    shortDescription: "Desc A",
    priceLabel: "À partir de 900 €",
    includedOptionIds: ["opt1", "opt2"],
  },
];

const options: QuoteWizardOption[] = [
  {
    id: "opt1",
    title: "Option incluse 1",
    slug: "opt1",
    pricingType: "FIXED",
    priceCents: 10000,
    priceFromCents: null,
    unitLabel: null,
    unitPriceCents: null,
  },
  {
    id: "opt2",
    title: "Option incluse 2",
    slug: "opt2",
    pricingType: "FROM",
    priceCents: null,
    priceFromCents: 20000,
    unitLabel: null,
    unitPriceCents: null,
  },
  {
    id: "opt3",
    title: "Option payante",
    slug: "opt3",
    pricingType: "PER_UNIT",
    priceCents: null,
    priceFromCents: null,
    unitLabel: "page",
    unitPriceCents: 5000,
  },
];

describe("Demande de devis wizard", () => {
  const futureDate = "2030-01-01";

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "quote-1" }),
    } as Response);
  });

  it("pré-coche et verrouille les options incluses", async () => {
    render(
      <QuoteWizard
        initialUser={{
          email: "test@example.com",
          firstName: "A",
          lastName: "B",
          phone: "",
        }}
        offers={offers}
        options={options}
        isAuthenticated
      />,
    );

    // aller à l'étape options
    // étape 0 invalid -> bouton désactivé
    const nextBtn = screen.getByText(/Étape suivante/i);
    expect(nextBtn).toBeDisabled();
    fireEvent.change(
      screen.getByPlaceholderText(/Décrivez brièvement votre projet/i),
      {
        target: { value: "Description suffisamment longue" },
      },
    );
    fireEvent.click(screen.getByText(/Étape suivante/i)); // infos -> format
    fireEvent.click(screen.getByText(/Étape suivante/i)); // format -> options

    // bloc des inclus
    expect(
      screen.getByText(/Inclus dans l'offre choisie/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Option incluse 1/i)).toBeInTheDocument();

    // option non incluse reste modifiable
    const extraOption = screen.getByLabelText(/option payante/i, {
      selector: "input",
    });
    fireEvent.click(extraOption);
    await waitFor(() =>
      expect(
        screen.getByRole("checkbox", { name: /option payante/i }),
      ).toBeChecked(),
    );
  });

  it("parcourt tout le workflow en non connecté jusqu'au succès", async () => {
    render(
      <QuoteWizard
        initialUser={{ email: "" }}
        offers={offers}
        options={options}
        isAuthenticated={false}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText(/Décrivez brièvement votre projet/i),
      { target: { value: "Un projet complet à livrer rapidement" } },
    );
    fireEvent.click(screen.getByText(/Étape suivante/i)); // vers format

    fireEvent.click(screen.getByText(/Étape suivante/i)); // vers options
    fireEvent.click(screen.getByLabelText(/Option payante/i));
    fireEvent.click(screen.getByText(/Étape suivante/i)); // vers rendez-vous

    fireEvent.change(screen.getByPlaceholderText(/Objet du rendez-vous/i), {
      target: { value: "Découverte du projet" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Détails/i), {
      target: { value: "Détails suffisant pour valider la prise de rdv" },
    });
    const rdvDate = document.querySelector(
      'input[type="date"]',
    ) as HTMLInputElement;
    const rdvTime = document.querySelector(
      'input[type="time"]',
    ) as HTMLInputElement;
    fireEvent.change(rdvDate, { target: { value: futureDate } });
    fireEvent.change(rdvTime, { target: { value: "10:00" } });
    fireEvent.click(screen.getByText(/Étape suivante/i)); // vers contact

    fireEvent.change(screen.getByPlaceholderText("Prénom"), {
      target: { value: "Marie" },
    });
    fireEvent.change(screen.getByPlaceholderText("Nom"), {
      target: { value: "Curie" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "marie@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Téléphone"), {
      target: { value: "0600000000" },
    });

    const submitBtn = screen.getAllByRole("button", {
      name: /Envoyer le devis/i,
    })[0];
    fireEvent.click(submitBtn);

    await waitFor(() =>
      expect(screen.getByText(/Merci ! Votre demande de devis/)).toBeVisible(),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/quotes",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
    const body = JSON.parse(
      (global.fetch as jest.Mock).mock.calls[0][1].body as string,
    );
    expect(body).toMatchObject({
      projectDescription: expect.stringContaining("projet complet"),
      serviceOfferId: "offer1",
      offerOptionIds: expect.arrayContaining(["opt3"]),
      firstName: "Marie",
      lastName: "Curie",
    });
  });

  it("permet un parcours complet pour un utilisateur connecté", async () => {
    render(
      <QuoteWizard
        initialUser={{
          email: "client@example.com",
          firstName: "Jean",
          lastName: "Dupont",
          phone: "0610101010",
        }}
        offers={offers}
        options={options}
        isAuthenticated
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText(/Décrivez brièvement votre projet/i),
      { target: { value: "Projet connecté avec besoins précis" } },
    );
    fireEvent.click(screen.getByText(/Étape suivante/i)); // format
    fireEvent.click(screen.getByText(/Étape suivante/i)); // options
    fireEvent.click(screen.getByLabelText(/Option payante/i));
    fireEvent.click(screen.getByText(/Étape suivante/i)); // rendez-vous

    fireEvent.change(screen.getByPlaceholderText(/Objet du rendez-vous/i), {
      target: { value: "Point projet" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Détails/i), {
      target: { value: "Détails pour l'appel" },
    });
    const rdvDate = document.querySelector(
      'input[type="date"]',
    ) as HTMLInputElement;
    const rdvTime = document.querySelector(
      'input[type="time"]',
    ) as HTMLInputElement;
    fireEvent.change(rdvDate, { target: { value: futureDate } });
    fireEvent.change(rdvTime, { target: { value: "11:30" } });
    fireEvent.click(screen.getByText(/Étape suivante/i)); // contact

    const submitBtn = screen.getAllByRole("button", {
      name: /Envoyer le devis/i,
    })[0];
    fireEvent.click(submitBtn);

    await waitFor(() =>
      expect(screen.getByText(/Merci ! Votre demande de devis/)).toBeVisible(),
    );
    const body = JSON.parse(
      (global.fetch as jest.Mock).mock.calls.slice(-1)[0][1].body as string,
    );
    expect(body).toMatchObject({
      email: "client@example.com",
      serviceOfferId: "offer1",
      offerOptionIds: expect.arrayContaining(["opt3"]),
    });
  });
});
