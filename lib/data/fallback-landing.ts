import { ServiceOffer } from "@prisma/client";

export const fallbackFeaturedOffer: Partial<ServiceOffer> & {
  offerOptions: Array<{ id: string; title: string; slug: string }>;
  features: Array<{ label: string; icon: string }>;
  steps: Array<{ title: string; description: string }>;
} = {
  title: "Site vitrine clé en main",
  subtitle: "Un site moderne, rapide et prêt à l’emploi",
  shortDescription:
    "Structure claire, design soigné, SEO local et prise en main simple pour écoles, associations, artisans et TPE.",
  targetAudience: "Écoles, associations, artisans, TPE",
  priceLabel: "À partir de 800 €",
  durationLabel: "2 à 4 semaines",
  engagementLabel: "Forfait, sans engagement long terme",
  ctaLabel: "Demander un devis",
  ctaLink: "/demande-devis",
  features: [
    { label: "Design moderne & responsive", icon: "🖥️" },
    { label: "SEO local inclus", icon: "📍" },
    { label: "Sécurité & performance", icon: "🔒" },
    { label: "Interface simple à gérer", icon: "✅" },
  ],
  steps: [
    { title: "Analyse des besoins", description: "Objectifs et publics." },
    { title: "Structure & maquette", description: "Parcours clairs." },
    { title: "Développement", description: "Site rapide, mobile, SEO." },
    { title: "Mise en ligne", description: "Handover et suivi." },
  ],
  offerOptions: [
    {
      id: "opt-fallback-1",
      title: "Formulaire avancé",
      slug: "advanced-form",
    },
    {
      id: "opt-fallback-2",
      title: "SEO local avancé",
      slug: "seo-local-advanced",
    },
  ],
};

export const fallbackFeaturedCase = {
  id: "fallback-case",
  title: "Site vitrine moderne pour une école",
  customer: "École locale",
  description:
    "Navigation simplifiée, contenus parent clairs, design moderne et optimisé mobile.",
  url: "https://www.ecole-st-augustin.fr",
  imageUrl: "/images/st-augustin.png",
  results: [
    {
      id: "res-f1",
      label: "Navigation claire pour les parents",
      slug: "nav-parents",
    },
    {
      id: "res-f2",
      label: "Informations accessibles rapidement",
      slug: "info-rapides",
    },
    { id: "res-f3", label: "SEO local optimisé", slug: "seo-local" },
    { id: "res-f4", label: "Site rapide et mobile", slug: "mobile-rapide" },
  ],
  features: [
    { id: "feat-f1", label: "Mobile first", slug: "mobile-first" },
    { id: "feat-f2", label: "Design épuré", slug: "design-epure" },
    { id: "feat-f3", label: "SEO local", slug: "seo-local" },
  ],
};
