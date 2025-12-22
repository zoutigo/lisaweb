import Link from "next/link";
import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    title: "1. Analyse du besoin",
    items: [
      "Comprendre votre activité, vos objectifs et vos utilisateurs.",
      "À qui s’adresse le site et que doit-il permettre (informer, rassurer, générer des contacts) ?",
      "Livrable : structure du site + objectifs clairs.",
    ],
    accent: "from-[#e0e7ff] to-white",
  },
  {
    title: "2. Structure & expérience utilisateur (UX)",
    items: [
      "Organisation des pages et parcours des visiteurs.",
      "Mise en avant des informations importantes, sans jargon.",
      "Un site simple à comprendre, facile à utiliser.",
    ],
    accent: "from-[#e0f2fe] to-white",
  },
  {
    title: "3. Développement agile",
    items: [
      "Le site prend forme progressivement, par blocs.",
      "Retours réguliers, ajustements en cours de route.",
      "Chaque fonctionnalité est développée et testée avant la suivante.",
    ],
    accent: "from-[#f1f5f9] to-white",
  },
  {
    title: "4. Mise en ligne & optimisation",
    items: [
      "Performance, sécurité, mobile first et SEO de base.",
      "Tests finaux avant publication.",
      "Hébergement optimisé pour la stabilité.",
    ],
    accent: "from-[#fff7ed] to-white",
  },
  {
    title: "5. Suivi & évolutions",
    items: [
      "Modifications, nouvelles pages, conseils continus.",
      "Un site qui peut évoluer sans repartir de zéro.",
    ],
    accent: "from-[#fef2f2] to-white",
  },
];

const stack = [
  {
    title: "Next.js",
    text: "Un site rapide, bien référencé et prêt pour le long terme.",
    icon: "⚡",
  },
  {
    title: "TypeScript",
    text: "Moins d’erreurs, plus de fiabilité pour votre projet.",
    icon: "✅",
  },
  {
    title: "Prisma + base de données",
    text: "Données structurées et sécurisées, faciles à maintenir.",
    icon: "🗂️",
  },
  {
    title: "Hébergement eco-responsable",
    text: "Performance, sécurité et disponibilité pour votre site.",
    icon: "☁️",
  },
];

const impacts = [
  "Visibilité claire sur l’avancement.",
  "Échanges simples et humains.",
  "Délais maîtrisés.",
  "Site fiable et sécurisé.",
  "Un site pensé pour durer.",
];

export const metadata = {
  title: "Ma méthode de travail | LisaWeb",
  description:
    "Une méthode de travail claire et humaine pour créer votre site web : approche agile simplifiée, étapes, stack moderne et proximité locale.",
};

export default function MethodePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9fc] via-white to-[#edf1ff] text-[#111827]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,91,255,0.12),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.12),transparent_20%),radial-gradient(circle_at_60%_80%,rgba(200,243,211,0.16),transparent_25%)] blur-3xl" />

      <Section className="pt-16 sm:pt-20">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1b2653] via-[#24337a] to-[#3b5bff] px-6 py-10 text-white shadow-[0_25px_80px_-35px_rgba(0,0,0,0.55)] sm:px-10 sm:py-12 lg:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_30%),linear-gradient(120deg,rgba(255,255,255,0.08),transparent_40%)]" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col gap-5">
              <Badge className="bg-white/20 text-white">
                Organisation + pédagogie
              </Badge>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Ma méthode de travail
              </h1>
              <p className="text-lg text-white/90">
                Un cadre clair, humain et efficace pour créer votre site web.
                Inspirée de l’agile, adaptée aux projets concrets : vous savez
                toujours où on en est, sans jargon.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border border-white/30 px-3 py-1">
                  Transparence sur l’avancement
                </span>
                <span className="rounded-full border border-white/30 px-3 py-1">
                  Échanges réguliers
                </span>
                <span className="rounded-full border border-white/30 px-3 py-1">
                  Délais maîtrisés
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/rendezvous"
                  className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-white px-5 py-3 text-sm font-semibold text-[#1b2653] shadow-[0_12px_30px_rgba(59,91,255,0.25)] transition hover:bg-[#f2f4ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B5BFF]"
                >
                  Discutons de votre projet
                </Link>
                <Link
                  href="/#process"
                  className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Voir le résumé
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute left-6 top-6 h-28 w-28 rounded-full bg-white/15 blur-3xl" />
              <div className="relative rounded-3xl border border-white/30 bg-white/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                  Agile simplifiée
                </p>
                <ul className="mt-4 space-y-3 text-white/90">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-lg">✅</span>
                    <span>
                      On avance par étapes courtes, avec validations régulières.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-lg">🤝</span>
                    <span>
                      Vous gardez la maîtrise du projet, je gère la méthode.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-lg">🔁</span>
                    <span>On ajuste en cours de route si besoin.</span>
                  </li>
                </ul>
                <p className="mt-4 rounded-2xl bg-white/10 p-3 text-sm text-white/90">
                  Pas besoin de connaître Scrum : je m’occupe de l’organisation,
                  vous vous concentrez sur votre activité.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Agilité expliquée simplement"
          title="Une approche inspirée de l’agile, sans jargon inutile"
          description="On avance progressivement, on valide ensemble, on ajuste si besoin. Vous gardez la maîtrise du projet."
        />
      </Section>

      <Section className="pt-4">
        <SectionHeading
          eyebrow="Le phasage du projet"
          title="Les étapes de votre projet web"
          description="Chaque étape est claire, lisible et pensée pour les écoles, associations, artisans et TPE."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {steps.map((step) => (
            <div
              key={step.title}
              className={`rounded-2xl bg-gradient-to-b ${step.accent} p-6 shadow-[0_14px_38px_-24px_rgba(27,38,83,0.28)]`}
            >
              <h3 className="text-lg font-semibold text-[#1b2653]">
                {step.title}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-[#374151]">
                {step.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 text-[#3b5bff]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Stack moderne"
          title="Une stack moderne, fiable et durable"
          description="Technologies utilisées par des entreprises reconnues, adaptées à des projets locaux."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {stack.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_12px_36px_-24px_rgba(27,38,83,0.28)]"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <h3 className="text-lg font-semibold text-[#1b2653]">
                  {item.title}
                </h3>
              </div>
              <p className="mt-2 text-sm text-[#374151]">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Bénéfices"
          title="Ce que ma méthode vous apporte"
          description="Clarté, échanges simples, délais maîtrisés et un site fiable."
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {impacts.map((impact) => (
            <div
              key={impact}
              className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] p-4 text-sm font-semibold text-[#1b2653] shadow-[0_10px_30px_-24px_rgba(27,38,83,0.25)]"
            >
              {impact}
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Proximité"
          title="Une méthode adaptée aux projets locaux"
          description="Habitué aux projets d’écoles, associations et entreprises de Pont-de-Chéruy et de l’Est lyonnais."
        />
        <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_16px_50px_-32px_rgba(27,38,83,0.3)]">
            <p className="text-sm text-[#374151]">
              La méthode reste légère, sans réunions interminables : des points
              réguliers, des livrables concrets et un langage clair pour tous
              les interlocuteurs.
            </p>
            <p className="mt-3 text-sm text-[#374151]">
              Objectif : un site moderne et utile, qui reflète votre activité
              locale et qui peut évoluer facilement.
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-[#eef2ff] via-white to-[#e0f2fe] p-6 shadow-[0_16px_50px_-32px_rgba(27,38,83,0.3)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1b2653]">
              Vous restez en contrôle
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#374151]">
              <li>Points rapides et réguliers.</li>
              <li>Livrables clairs à chaque étape.</li>
              <li>Décisions prises ensemble, sans jargon.</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section className="pb-20" id="cta-method">
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#1b2653] via-[#24337a] to-[#3b5bff] px-6 py-10 text-white shadow-[0_20px_70px_-35px_rgba(0,0,0,0.45)] sm:px-10 sm:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.14),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.1),transparent_30%)]" />
          <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                Prochaines étapes
              </p>
              <h2 className="text-3xl font-semibold">Vous avez un projet ?</h2>
              <p className="text-sm text-white/90">
                Je vous explique ma méthode lors d’un premier échange, sans
                engagement. On clarifie vos objectifs et on définit un plan
                simple.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/rendezvous"
                  className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-white px-5 py-3 text-sm font-semibold text-[#1b2653] shadow-[0_12px_30px_rgba(59,91,255,0.25)] transition hover:bg-[#f2f4ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B5BFF]"
                >
                  Discutons de votre projet
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Retour à l’accueil
                </Link>
              </div>
            </div>
            <div className="relative rounded-2xl border border-white/30 bg-white/10 p-5 text-sm text-white/90 shadow-[0_12px_40px_-28px_rgba(0,0,0,0.45)] backdrop-blur">
              <p className="font-semibold text-white">
                Prêt pour un site clair et moderne ?
              </p>
              <p className="mt-2">
                Ensemble, on avance étape par étape, avec des échanges humains
                et une organisation simple. Vous savez toujours où on en est.
              </p>
              <div className="mt-4 space-y-2 text-white/90">
                <div className="flex items-start gap-2">
                  <span className="mt-1 text-lg">📅</span>
                  <span>Points réguliers et décisions partagées.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 text-lg">📈</span>
                  <span>Un site pensé pour durer, évoluer et convertir.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
