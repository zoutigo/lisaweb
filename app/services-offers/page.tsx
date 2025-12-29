export const runtime = "nodejs";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import ServicesOffersClient from "./services-offers-client";

export const metadata = {
  title:
    "Formats d’accompagnement web | Sites vitrines et refontes à Pont-de-Chéruy",
  description:
    "Choisissez le format adapté : site vitrine, refonte ou évolution continue pour écoles, associations, artisans et TPE en Isère (Pont-de-Chéruy, Tignieu, Crémieu). Tarifs clairs, options modulaires, délais annoncés.",
  keywords: [
    "offres site vitrine pont-de-chéruy",
    "refonte site tpe isère",
    "accompagnement web crémieu",
    "service creation site tignieu",
  ],
};

export default async function ServiceOffersLandingPage() {
  let offers: Prisma.ServiceOfferGetPayload<{
    include: {
      features: true;
      steps: true;
      useCases: true;
      offerOptions: true;
    };
  }>[] = [];
  try {
    offers = await prisma.serviceOffer.findMany({
      orderBy: { order: "asc" },
      include: {
        features: { orderBy: { order: "asc" } },
        steps: { orderBy: { order: "asc" } },
        useCases: true,
        offerOptions: true,
      },
    });
  } catch (error) {
    console.error("Failed to load service offers", error);
    offers = [];
  }

  const initialOffers = offers.map((offer) => ({
    ...offer,
    subtitle: offer.subtitle ?? undefined,
    createdAt:
      offer.createdAt instanceof Date
        ? offer.createdAt.toISOString()
        : String(offer.createdAt),
    updatedAt:
      offer.updatedAt instanceof Date
        ? offer.updatedAt.toISOString()
        : String(offer.updatedAt),
    features: (offer.features ?? []).map((f) => ({
      id: f.id,
      label: f.label,
      icon: f.icon ?? undefined,
      order: f.order ?? undefined,
    })),
    steps: (offer.steps ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      order: s.order ?? undefined,
    })),
    useCases: (offer.useCases ?? []).map((u) => ({
      id: u.id,
      title: u.title,
      description: u.description,
    })),
    offerOptions:
      (offer.offerOptions ?? []).map((o) => ({
        id: o.id,
        title: o.title,
        slug: o.slug,
      })) ?? [],
  })) satisfies Parameters<typeof ServicesOffersClient>[0]["initialOffers"];

  return <ServicesOffersClient initialOffers={initialOffers} />;
}
