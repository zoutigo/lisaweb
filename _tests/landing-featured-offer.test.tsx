/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { LandingFeaturedOffer } from "@/components/landing-featured-offer";

const baseOffer = {
  title: "Site vitrine clé en main",
  subtitle: "Sous-titre",
  shortDescription: "Desc courte",
  targetAudience: "TPE",
  priceLabel: "Sur devis",
  durationLabel: "2 à 4 semaines",
  engagementLabel: "Forfait",
  ctaLabel: "Demander",
  ctaLink: "/demande-devis",
  features: [{ label: "Feature 1", icon: "✅" }],
  steps: [{ title: "Analyse", description: "Comprendre" }],
};

describe("LandingFeaturedOffer", () => {
  it("affiche les options incluses quand présentes", () => {
    render(
      <LandingFeaturedOffer
        offer={{
          ...baseOffer,
          offerOptions: [
            { id: "opt1", title: "Ecommerce", slug: "ecommerce" },
            { id: "opt2", title: "Paiement", slug: "online-payment" },
          ],
        }}
      />,
    );

    expect(screen.getByText(/options incluses/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ecommerce/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/\(online-payment\)/i)).toBeInTheDocument();
  });

  it("n'affiche pas le bloc si aucune option (fallback)", () => {
    render(<LandingFeaturedOffer offer={{ ...baseOffer, offerOptions: [] }} />);

    expect(screen.queryByText(/options incluses/i)).not.toBeInTheDocument();
    expect(screen.getByText(/site vitrine clé en main/i)).toBeInTheDocument();
  });
});
