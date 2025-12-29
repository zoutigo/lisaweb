import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const offers = [
  {
    slug: "site-vitrine-cle-en-main",
    title: "Site vitrine clé en main",
    subtitle: "Un site professionnel, rapide et prêt à l’emploi",
    shortDescription:
      "Je conçois et développe votre site web de A à Z, avec un design moderne et un référencement local optimisé.",
    longDescription:
      "Un accompagnement complet : structure claire, design moderne, développement Next.js rapide et sécurisé, SEO local et prise en main simple pour rester autonome.",
    targetAudience: "Écoles, associations, artisans, TPE",
    priceLabel: "À partir de … €",
    durationDays: 28,
    durationLabel: "2 à 4 semaines",
    engagementLabel: "Forfait, sans engagement",
    isFeatured: true,
    order: 1,
    ctaLabel: "Demander un devis",
    ctaLink: "/contact",
    features: [
      { label: "Site moderne & responsive", icon: "🖥️", order: 0 },
      { label: "SEO local inclus", icon: "📍", order: 1 },
      { label: "Sécurité & performance", icon: "🔒", order: 2 },
      { label: "Interface simple à gérer", icon: "✅", order: 3 },
    ],
    steps: [
      {
        title: "Analyse des besoins",
        description: "Comprendre vos objectifs et votre public.",
        order: 0,
      },
      {
        title: "Structure & design",
        description: "Arborescence claire et maquette cohérente.",
        order: 1,
      },
      {
        title: "Développement",
        description: "Site rapide, sécurisé et optimisé mobile.",
        order: 2,
      },
      {
        title: "Mise en ligne & accompagnement",
        description: "Handover, suivi et conseils SEO local.",
        order: 3,
      },
    ],
    useCases: [
      {
        title: "École ou association locale",
        description: "Informer, rassurer et faciliter les inscriptions.",
      },
      {
        title: "Artisan ou TPE",
        description:
          "Mettre en avant vos réalisations et générer des demandes.",
      },
    ],
  },
  {
    slug: "refonte-site-existant",
    title: "Refonte de site existant",
    subtitle: "Modernisez votre site sans repartir de zéro",
    shortDescription:
      "Un site plus clair, plus rapide et mieux référencé pour repartir sur de bonnes bases.",
    longDescription:
      "Audit rapide, nouvelle expérience utilisateur, performances améliorées, sécurité renforcée et migration accompagnée pour ne rien perdre.",
    targetAudience: "Clients déjà équipés, site obsolète ou lent",
    priceLabel: "Sur devis",
    durationDays: 30,
    durationLabel: "2 à 6 semaines selon l’existant",
    engagementLabel: "Refonte guidée",
    isFeatured: false,
    order: 2,
    ctaLabel: "Parler de ma refonte",
    ctaLink: "/contact",
    features: [
      { label: "Audit UX & technique", icon: "🧭", order: 0 },
      { label: "Performance et SEO améliorés", icon: "⚡", order: 1 },
      { label: "Design modernisé", icon: "🎨", order: 2 },
      { label: "Migration accompagnée", icon: "🤝", order: 3 },
    ],
    steps: [
      {
        title: "Audit et objectifs",
        description: "Identifier les points faibles et ce qui doit rester.",
        order: 0,
      },
      {
        title: "Nouvelle expérience",
        description: "Structure, parcours et maquette modernisée.",
        order: 1,
      },
      {
        title: "Implémentation",
        description: "Optimisation du code, SEO, temps de chargement.",
        order: 2,
      },
      {
        title: "Mise en ligne",
        description: "Basculer sans perte et accompagner la prise en main.",
        order: 3,
      },
    ],
    useCases: [
      {
        title: "Site lent ou daté",
        description: "Moderniser le design et accélérer les performances.",
      },
      {
        title: "Contenus peu clairs",
        description:
          "Rendre l’information accessible et rassurer les visiteurs.",
      },
    ],
  },
  {
    slug: "accompagnement-evolution-continue",
    title: "Accompagnement & évolution continue",
    subtitle: "Faites évoluer votre site au fil du temps",
    shortDescription:
      "Ajouts de pages, optimisations SEO et nouvelles fonctionnalités pour durer.",
    longDescription:
      "Un partenariat souple : petites évolutions régulières, optimisations ciblées, conseils et suivi pour un site qui reste performant.",
    targetAudience: "Clients souhaitant faire évoluer leur site régulièrement",
    priceLabel: "Formule souple",
    durationDays: 14,
    durationLabel: "Mission récurrente ou ponctuelle",
    engagementLabel: "Sans engagement long terme",
    isFeatured: false,
    order: 3,
    ctaLabel: "Planifier une évolution",
    ctaLink: "/contact",
    features: [
      { label: "Ajout de nouvelles pages", icon: "➕", order: 0 },
      { label: "SEO progressif", icon: "📈", order: 1 },
      { label: "Fonctionnalités sur mesure", icon: "🧩", order: 2 },
      { label: "Support continu", icon: "🤝", order: 3 },
    ],
    steps: [
      {
        title: "Roadmap simple",
        description: "Lister les évolutions prioritaires.",
        order: 0,
      },
      {
        title: "Sprints courts",
        description: "Livraisons régulières et feedbacks rapides.",
        order: 1,
      },
      {
        title: "Mesure & ajustements",
        description: "Suivi des résultats et optimisations ciblées.",
        order: 2,
      },
    ],
    useCases: [
      {
        title: "Nouvelles pages ou fonctionnalités",
        description: "Ajouter un blog, une FAQ, des formulaires ciblés.",
      },
      {
        title: "Amélioration continue",
        description: "Renforcer le SEO local, optimiser le parcours.",
      },
    ],
  },
];

const faqCategories = [
  { name: "Général", order: 1 },
  { name: "Méthode & organisation", order: 2 },
  { name: "Technique & sécurité", order: 3 },
  { name: "Après la mise en ligne", order: 4 },
];

const faqs = [
  {
    question: "Combien coûte un site web ?",
    answer:
      "La plupart des sites vitrines démarrent autour de quelques milliers d’euros. On valide ensemble le périmètre pour adapter le budget.",
    categoryName: "Général",
  },
  {
    question: "Combien de temps faut-il pour créer un site ?",
    answer:
      "En moyenne 2 à 4 semaines pour un site vitrine, selon le nombre de pages et la disponibilité des contenus.",
    categoryName: "Général",
  },
  {
    question: "Est-ce que je peux gérer mon site seul ensuite ?",
    answer:
      "Oui, l’interface est simple et je fournis une prise en main. Je reste disponible en soutien si besoin.",
    categoryName: "Général",
  },
  {
    question: "Comment se déroule un projet ?",
    answer:
      "Analyse rapide, structure & design, développement, mise en ligne avec validation à chaque étape. Le process est clair et sans jargon.",
    categoryName: "Méthode & organisation",
  },
  {
    question: "Quelles technologies utilisez-vous ?",
    answer:
      "Next.js avec TypeScript pour la performance, Prisma pour la base de données, et de bonnes pratiques de sécurité/SEO.",
    categoryName: "Technique & sécurité",
  },
  {
    question: "Que se passe-t-il après la mise en ligne ?",
    answer:
      "Je propose un accompagnement souple : petites évolutions, SEO progressif, ajout de pages. Pas d’engagement lourd.",
    categoryName: "Après la mise en ligne",
  },
];

const customerCases = [
  {
    title: "Site vitrine moderne pour une école",
    customer: "École Saint-Augustin",
    description:
      "Refonte complète du site : navigation simplifiée, contenus parent, design clair.",
    url: "https://www.ecole-st-augustin.fr",
    imageUrl: "/images/st-augustin.png",
    resultSlugs: ["nav-parents", "info-rapides", "seo-local", "mobile-rapide"],
    featureSlugs: ["mobile-first", "design-epure", "seo-local"],
  },
  {
    title: "Site associatif avec agenda",
    customer: "Association locale",
    description:
      "Site vitrine avec agenda d’événements et formulaire de contact clair.",
    url: "https://www.association-exemple.fr",
    imageUrl: "/images/placeholder-case.png",
    resultSlugs: ["agenda-lisible", "contact-facile", "conversion-plus"],
    featureSlugs: ["formulaires-cibles", "performance", "design-contemporain"],
  },
  {
    title: "Refonte pour un artisan",
    customer: "Artisan bâtisseur",
    description:
      "Modernisation d’un site obsolète avec mise en avant des réalisations.",
    url: "https://www.artisan-exemple.fr",
    imageUrl: "/images/placeholder-case.png",
    resultSlugs: ["portfolio-clair", "demandes-en-hausse"],
    featureSlugs: ["accessibilite", "cms-simple", "support", "securite"],
  },
];

const caseResults = [
  { slug: "nav-parents", label: "Navigation claire pour les parents" },
  { slug: "info-rapides", label: "Informations accessibles rapidement" },
  { slug: "seo-local", label: "SEO local optimisé" },
  { slug: "mobile-rapide", label: "Site rapide et mobile" },
  { slug: "contact-simple", label: "Formulaires de contact simplifiés" },
  { slug: "agenda-lisible", label: "Agenda lisible" },
  { slug: "contact-facile", label: "Demande de contact facilitée" },
  { slug: "portfolio-clair", label: "Portfolio clair" },
  { slug: "demandes-en-hausse", label: "Demandes entrantes en hausse" },
  { slug: "conversion-plus", label: "Meilleure conversion" },
];

const caseFeatures = [
  { slug: "mobile-first", label: "Mobile first" },
  { slug: "design-epure", label: "Design épuré" },
  { slug: "seo-local", label: "SEO local" },
  { slug: "formulaires-cibles", label: "Formulaires ciblés" },
  { slug: "performance", label: "Performance renforcée" },
  { slug: "design-contemporain", label: "Design contemporain" },
  { slug: "accessibilite", label: "Accessibilité soignée" },
  { slug: "cms-simple", label: "CMS simple à gérer" },
  { slug: "support", label: "Support et suivi" },
  { slug: "securite", label: "Sécurité renforcée" },
];

const offerOptions = [
  {
    slug: "ecommerce",
    title: "Boutique en ligne",
    descriptionShort: "Vente de produits en ligne avec paiement sécurisé.",
    descriptionLong:
      "Vente de produits en ligne avec paiement sécurisé. Inclut : panier, paiement (Stripe), emails transactionnels. Notes : dépend du nombre de produits et livraisons.",
    pricingType: "FROM",
    priceFromCents: 90000,
    durationDays: 10,
    order: 1,
    constraintsJson:
      '{"dependsOn":["transactional-emails"],"notes":"Prévoir coût Stripe + configuration des webhooks"}',
  },
  {
    slug: "online-payment",
    title: "Paiement en ligne",
    descriptionShort:
      "Paiement en ligne pour dons, inscriptions ou prestations.",
    descriptionLong:
      "Paiement en ligne pour dons, inscriptions ou prestations, sans boutique complète.",
    pricingType: "FIXED",
    priceCents: 25000,
    durationDays: 2,
    order: 2,
  },
  {
    slug: "advanced-form",
    title: "Formulaire avancé / devis intelligent",
    descriptionShort:
      "Formulaire avec champs conditionnels, devis ou demandes ciblées.",
    descriptionLong:
      "Formulaire avec champs conditionnels, devis ou demandes ciblées, pour qualifier les leads.",
    pricingType: "FIXED",
    priceCents: 18000,
    durationDays: 3,
    order: 3,
  },
  {
    slug: "authentication",
    title: "Espace membre / authentification",
    descriptionShort: "Connexion sécurisée, rôles utilisateurs, accès privé.",
    descriptionLong:
      "Connexion sécurisée, gestion des rôles et accès privé pour des contenus ou espaces restreints.",
    pricingType: "FROM",
    priceFromCents: 60000,
    durationDays: 7,
    order: 4,
    constraintsJson:
      '{"dependsOn":["transactional-emails"],"notes":"Prévoir Politique de mots de passe et RGPD"}',
  },
  {
    slug: "oauth-google",
    title: "Connexion Google / OAuth",
    descriptionShort: "Connexion via Google (ou autre fournisseur).",
    descriptionLong:
      "Connexion via Google (ou autre fournisseur OAuth) pour simplifier l’inscription et l’accès.",
    pricingType: "FIXED",
    priceCents: 20000,
    durationDays: 2,
    order: 5,
    constraintsJson:
      '{"dependsOn":["authentication"],"notes":"Nécessite clés OAuth et paramétrage des URLs de callback"}',
  },
  {
    slug: "newsletter",
    title: "Newsletter / email marketing",
    descriptionShort:
      "Inscription, gestion des abonnés, envoi de newsletters (hors coût fournisseur).",
    descriptionLong:
      "Inscription, gestion des abonnés et envoi de newsletters. Notes : hors coût du fournisseur (Mailjet, Brevo…).",
    pricingType: "FROM",
    priceFromCents: 25000,
    durationDays: 3,
    order: 6,
    constraintsJson:
      '{"notes":"Hors coût fournisseur (Mailjet, Brevo…). Configuré et relié au site."}',
  },
  {
    slug: "transactional-emails",
    title: "Emails transactionnels",
    descriptionShort: "Emails automatiques fiables et configurés (SPF, DKIM).",
    descriptionLong:
      "Emails automatiques fiables et configurés (SPF, DKIM) pour contact, commande ou inscription.",
    pricingType: "FIXED",
    priceCents: 18000,
    durationDays: 2,
    order: 7,
  },
  {
    slug: "booking",
    title: "Réservation / prise de rendez-vous",
    descriptionShort:
      "Prise de rendez-vous en ligne (Calendly ou système intégré).",
    descriptionLong:
      "Prise de rendez-vous en ligne (Calendly ou système intégré), notifications et suivi.",
    pricingType: "FROM",
    priceFromCents: 30000,
    durationDays: 4,
    order: 8,
  },
  {
    slug: "seo-local-advanced",
    title: "SEO local avancé",
    descriptionShort:
      "Optimisation SEO locale (villes, Google Business Profile).",
    descriptionLong:
      "Optimisation SEO locale : ciblage des villes, Google Business Profile, contenu localisé.",
    pricingType: "FIXED",
    priceCents: 35000,
    durationDays: 5,
    order: 9,
  },
  {
    slug: "extra-pages",
    title: "Pages supplémentaires",
    descriptionShort:
      "Création de pages supplémentaires (contenu + intégration).",
    descriptionLong:
      "Création de pages supplémentaires (contenu + intégration) pour étendre le site.",
    pricingType: "PER_UNIT",
    unitLabel: "page",
    unitPriceCents: 9000,
    durationDays: 1,
    order: 10,
  },
  {
    slug: "multilingual",
    title: "Multilingue",
    descriptionShort: "Site disponible en plusieurs langues.",
    descriptionLong:
      "Site disponible en plusieurs langues avec sélecteur et gestion des contenus localisés.",
    pricingType: "PER_UNIT",
    unitLabel: "langue",
    unitPriceCents: 25000,
    durationDays: 2,
    order: 11,
  },
  {
    slug: "blog",
    title: "Blog / actualités",
    descriptionShort:
      "Blog avec gestion des articles et catégories pour publier facilement.",
    descriptionLong:
      "Blog avec gestion des articles et catégories pour publier facilement et travailler le SEO.",
    pricingType: "FIXED",
    priceCents: 30000,
    durationDays: 3,
    order: 12,
  },
  {
    slug: "maintenance",
    title: "Maintenance & mises à jour",
    descriptionShort: "Sécurité, mises à jour, assistance légère (mensuel).",
    descriptionLong:
      "Sécurité, mises à jour, assistance légère. Forfait mensuel pour garder le site en forme.",
    pricingType: "PER_UNIT",
    unitLabel: "mois",
    unitPriceCents: 3900,
    durationDays: 2,
    order: 13,
    constraintsJson:
      '{"dependsOn":["hosting-monitoring"],"notes":"Contrat mensuel reconductible"}',
  },
  {
    slug: "hosting-monitoring",
    title: "Hébergement & monitoring",
    descriptionShort:
      "Hébergement optimisé, surveillance et sauvegardes (mensuel).",
    descriptionLong:
      "Hébergement optimisé, surveillance et sauvegardes, avec suivi des performances.",
    pricingType: "PER_UNIT",
    unitLabel: "mois",
    unitPriceCents: 2500,
    durationDays: 2,
    order: 14,
  },
  {
    slug: "backups",
    title: "Sauvegardes & restauration",
    descriptionShort:
      "Sauvegardes automatiques et restauration en cas de problème.",
    descriptionLong:
      "Sauvegardes automatiques et restauration en cas de problème, pour limiter les risques.",
    pricingType: "FIXED",
    priceCents: 12000,
    durationDays: 2,
    order: 15,
  },
];

async function main() {
  const existing = await prisma.serviceOffer.count();
  if (existing > 0) {
    console.log("Service offers already seeded, skipping.");
  } else {
    for (const offer of offers) {
      const { features, steps, useCases, ...data } = offer;
      await prisma.serviceOffer.create({
        data: {
          ...data,
          features: { create: features ?? [] },
          steps: { create: steps ?? [] },
          useCases: { create: useCases ?? [] },
        },
      });
    }

    console.log("Service offers seeded.");
  }

  const offerOptionsCount = await prisma.offerOption.count();
  for (const opt of offerOptions) {
    await prisma.offerOption.upsert({
      where: { slug: opt.slug },
      update: { ...opt },
      create: opt,
    });
  }
  console.log(
    offerOptionsCount === 0
      ? "Offer options seeded."
      : "Offer options upserted (prices refreshed).",
  );

  // Lier quelques options aux offres pour la landing
  const links = [
    {
      offerSlug: "site-vitrine-cle-en-main",
      optionSlugs: ["ecommerce", "online-payment", "advanced-form"],
    },
    {
      offerSlug: "refonte-site-existant",
      optionSlugs: ["seo-local-advanced", "transactional-emails", "blog"],
    },
    {
      offerSlug: "accompagnement-evolution-continue",
      optionSlugs: ["maintenance", "hosting-monitoring", "backups"],
    },
  ];

  for (const link of links) {
    const offer = await prisma.serviceOffer.findUnique({
      where: { slug: link.offerSlug },
    });
    if (!offer) continue;
    const optionIds = await prisma.offerOption.findMany({
      where: { slug: { in: link.optionSlugs } },
      select: { id: true },
    });
    if (optionIds.length === 0) continue;
    await prisma.serviceOffer.update({
      where: { id: offer.id },
      data: {
        offerOptions: {
          set: [],
          connect: optionIds.map((o) => ({ id: o.id })),
        },
      },
    });
  }

  const faqCount = await prisma.faq.count();
  const categoryCount = await prisma.faqCategory.count();

  if (categoryCount === 0) {
    for (const cat of faqCategories) {
      await prisma.faqCategory.create({ data: cat });
    }
    console.log("FAQ categories seeded.");
  }

  if (faqCount === 0) {
    for (const faq of faqs) {
      const category = await prisma.faqCategory.findFirst({
        where: { name: faq.categoryName },
      });
      await prisma.faq.create({
        data: {
          question: faq.question,
          answer: faq.answer,
          categoryId: category?.id ?? null,
        },
      });
    }
    console.log("FAQ seeded.");
  }

  // Seed sample quote request if none exists
  const quoteCount = await prisma.quoteRequest.count();
  if (quoteCount === 0) {
    const firstOffer = await prisma.serviceOffer.findFirst({
      orderBy: { order: "asc" },
      select: { id: true },
    });
    const someOptions = await prisma.offerOption.findMany({
      orderBy: { order: "asc" },
      take: 2,
      select: { id: true },
    });
    await prisma.quoteRequest.create({
      data: {
        firstName: "Alice",
        lastName: "Martin",
        email: "alice@example.com",
        phone: "+33600000000",
        projectDescription:
          "Site vitrine pour présenter mon activité locale, design moderne et options de paiement simple.",
        serviceOfferId: firstOffer?.id,
        offerOptions: {
          connect: someOptions.map((o) => ({ id: o.id })),
        },
        status: "NEW",
      },
    });
    console.log("Quote request seeded.");
  }

  // Upsert reference results and features
  for (const r of caseResults) {
    await prisma.customerCaseResult.upsert({
      where: { slug: r.slug },
      update: { label: r.label, order: r.order ?? 0 },
      create: { ...r, order: r.order ?? 0 },
    });
  }
  for (const f of caseFeatures) {
    await prisma.customerCaseFeature.upsert({
      where: { slug: f.slug },
      update: { label: f.label, order: f.order ?? 0 },
      create: { ...f, order: f.order ?? 0 },
    });
  }

  const customerCaseCount = await prisma.customerCase.count();
  if (customerCaseCount === 0) {
    for (const item of customerCases) {
      const { resultSlugs = [], featureSlugs = [], ...data } = item;
      const createdCase = await prisma.customerCase.create({
        data: { ...data, isFeatured: false },
      });
      if (resultSlugs.length) {
        await prisma.customerCase.update({
          where: { id: createdCase.id },
          data: {
            results: {
              connect: resultSlugs.map((slug) => ({ slug })),
            },
          },
        });
      }
      if (featureSlugs.length) {
        await prisma.customerCase.update({
          where: { id: createdCase.id },
          data: {
            features: {
              connect: featureSlugs.map((slug) => ({ slug })),
            },
          },
        });
      }
    }
    console.log("Customer cases seeded.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
