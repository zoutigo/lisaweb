import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";

const sectors = [
  {
    title: "Écoles",
    description:
      "Informer les familles, publier vos documents, valoriser votre établissement.",
    icon: "📘",
  },
  {
    title: "Associations",
    description:
      "Plus de visibilité locale, inscriptions facilitées, agenda clair.",
    icon: "🤝",
  },
  {
    title: "Artisans",
    description:
      "Devis rapide, photos avant/après, mise en valeur de votre savoir-faire.",
    icon: "🛠️",
  },
  {
    title: "TPE",
    description:
      "Une image professionnelle, des pages services claires, plus de demandes entrantes.",
    icon: "🏢",
  },
];

const process = [
  {
    title: "Je vous écoute",
    text: "Comprendre vos objectifs, votre public et vos contraintes est la base de tout.",
    color: "bg-[#DDE7FF]",
    icon: "🧭",
  },
  {
    title: "Je conçois un site clair et moderne",
    text: "Maquette, structure, design : tout est construit pour être simple et efficace.",
    color: "bg-[#C4F3D3]",
    icon: "🎨",
  },
  {
    title: "Je développe en Next.js",
    text: "Un site ultra-rapide, sécurisé, optimisé mobile & SEO, pensé pour durer.",
    color: "bg-[#E8D9FF]",
    icon: "⚡",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9fc] via-white to-[#edf1ff] text-[#111827]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,91,255,0.15),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.16),transparent_20%),radial-gradient(circle_at_60%_80%,rgba(200,243,211,0.18),transparent_25%)] blur-3xl" />
      <main>
        <Section className="pt-12 sm:pt-20">
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1b2653] to-[#3b5bff] px-6 py-10 text-white shadow-[0_25px_80px_-35px_rgba(0,0,0,0.55)] sm:px-10 sm:py-12 lg:px-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_30%),linear-gradient(120deg,rgba(255,255,255,0.08),transparent_40%)]" />
            <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="flex flex-col gap-6">
                <Badge className="bg-white/20 text-white">
                  Basé à Pont-de-Chéruy
                </Badge>
                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                  Votre développeur web local, pour un site moderne et efficace.
                </h1>
                <p className="text-lg text-white/90">
                  Basé à Pont-de-Chéruy, j’accompagne les écoles, associations,
                  artisans et TPE dans la création de sites web professionnels,
                  rapides et simples à gérer.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Button className="bg-white text-[#1b2653] hover:bg-[#f2f4ff]">
                    Prendre un rendez-vous
                  </Button>
                  <Button
                    variant="ghost"
                    className="border border-white/40 bg-white/10 text-white"
                  >
                    Voir mes services
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-white/80">
                  <span className="rounded-full border border-white/30 px-3 py-1">
                    Réponse en moins de 24h
                  </span>
                  <span className="rounded-full border border-white/30 px-3 py-1">
                    Accompagnement humain
                  </span>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="absolute h-64 w-64 rounded-full bg-white/15 blur-3xl" />
                <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-white/40 bg-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur">
                  <div className="flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-white to-[#d8e2ff] text-2xl font-semibold text-[#1b2653]">
                    Plisa
                  </div>
                  <div className="absolute -left-6 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#1b2653] shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                    Réponse sous 24h
                  </div>
                  <div className="absolute -right-4 bottom-6 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#1b2653] shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                    Accompagnement humain
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section id="sectors">
          <SectionHeading
            eyebrow="Ce que je fais pour vous"
            title="Des sites pensés pour vos visiteurs et vos objectifs."
            description="Écoles, associations, artisans, TPE : chaque carte correspond à un besoin réel."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {sectors.map((sector) => (
              <Card
                key={sector.title}
                className="flex flex-col gap-4 bg-[#f7f9fc] shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(59,91,255,0.18)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                    {sector.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[#1b2653]">
                    {sector.title}
                  </h3>
                </div>
                <p className="text-base text-[#4b5563]">{sector.description}</p>
              </Card>
            ))}
          </div>
          <div className="mt-6">
            <Button variant="ghost" className="px-0 text-[#1b2653]">
              Voir les pages dédiées →
            </Button>
          </div>
        </Section>

        <Section id="process">
          <SectionHeading
            eyebrow="Comment je travaille"
            title="Une approche humaine et structurée."
            description="On avance étape par étape, en restant clair et disponible."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {process.map((step) => (
              <Card
                key={step.title}
                className={`flex flex-col gap-3 border-none ${step.color}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{step.icon}</span>
                  <h3 className="text-lg font-semibold text-[#1b2653]">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm text-[#374151]">{step.text}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section id="case">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#e5e9ff] to-[#e8d9ff] p-8 shadow-[0_18px_50px_-24px_rgba(59,91,255,0.35)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,91,255,0.18),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(232,217,255,0.22),transparent_30%)]" />
              <div className="relative flex flex-col gap-4">
                <Badge className="bg-white text-[#1b2653]">Cas client</Badge>
                <h3 className="text-3xl font-semibold text-[#1b2653]">
                  Un site moderne et clair pour une école locale
                </h3>
                <p className="text-base text-[#374151]">
                  J’ai accompagné l’École Saint-Augustin dans la refonte
                  complète de son site web. Navigation simplifiée, design
                  moderne, informations facilement accessibles.
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-[#1b2653]">
                  {[
                    "Navigation claire",
                    "Design moderne",
                    "SEO local",
                    "Mobile first",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-white/80 px-3 py-1 shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <Button variant="secondary" className="w-fit">
                  Voir la réalisation
                </Button>
              </div>
            </div>
            <Card className="flex flex-col justify-center gap-4 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
              <h4 className="text-lg font-semibold text-[#1b2653]">
                Mockup du site
              </h4>
              <p className="text-sm text-[#4b5563]">
                Place ici une capture ou un visuel du site de l’école (mockup
                desktop ou mobile). Il met en avant le design clair, la
                navigation simple et les informations parents.
              </p>
              <div className="flex h-48 items-center justify-center rounded-[16px] border border-dashed border-[#d0d7ff] bg-[#f7f9fc] text-sm text-[#1b2653]">
                Espace visuel / capture écran
              </div>
            </Card>
          </div>
        </Section>

        <Section id="values" className="pb-16">
          <div className="overflow-hidden rounded-[24px] bg-[#edf1ff] p-10 shadow-[0_16px_50px_-32px_rgba(27,38,83,0.4)]">
            <SectionHeading
              eyebrow="Mes valeurs"
              title="Je mets l’humain au centre de chaque projet."
              description="Réactivité, clarté, design moderne, sécurité et connaissance du tissu local."
              align="center"
            />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "🤝 Proximité & écoute",
                "🧭 Conseils clairs, sans jargon",
                "⚡ Réactivité",
                "🎨 Design moderne & cohérent",
                "🔒 Sites sécurisés & maintenus",
                "📍 Expertise locale : Pont-de-Chéruy · Charvieu · Tignieu · Lyon Est",
              ].map((value) => (
                <div
                  key={value}
                  className="rounded-[16px] bg-white/80 p-4 text-sm text-[#1b2653] shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
                >
                  {value}
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section id="cta" className="pb-24">
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#2f48ff] to-[#151e5a] px-10 py-12 text-white shadow-[0_25px_80px_-35px_rgba(0,0,0,0.6)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_25%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.08),transparent_35%)]" />
            <div className="relative flex flex-col gap-6">
              <h2 className="text-3xl font-semibold">
                Vous souhaitez un site moderne, professionnel et simple à gérer
                ?
              </h2>
              <p className="text-lg text-white/85">
                Je vous accompagne de A à Z. Réponse garantie sous 24h.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  variant="secondary"
                  className="bg-white text-[#1b2653] hover:bg-[#f2f4ff]"
                >
                  Demander un devis gratuit
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-white/80">
                <span className="rounded-full border border-white/30 px-3 py-1">
                  Sans engagement
                </span>
                <span className="rounded-full border border-white/30 px-3 py-1">
                  Je m’adapte à votre budget
                </span>
                <span className="rounded-full border border-white/30 px-3 py-1">
                  Rendez-vous possible sur Pont-de-Chéruy / Lyon Est
                </span>
              </div>
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
}
