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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
