import type { SiteInfo } from "@prisma/client";

// Centralise all constant fallback data so it can be maintained easily.
export const fallbackSiteInfo: SiteInfo = {
  id: "fallback-site-info",
  name: "LISAWEB",
  email: "contact@valerymbele.fr",
  phone: "+33650597839",
  address: "89C rue du travail",
  city: "Pont-de-Chéruy",
  postalCode: "38230",
  country: "France",
  siret: null,
  codeApe: null,
  statut: "Entrepreneur individuel",
  responsable: "Valery Mbele",
  updatedAt: new Date(0),
};

export type FallbackSiteInfo = typeof fallbackSiteInfo;
