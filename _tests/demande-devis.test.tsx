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
});
