/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = {
  title: "FAQ sites web & SEO local | LisaWeb développeur web à Pont-de-Chéruy",
  description:
    "Questions fréquentes sur les tarifs, délais, méthode, technique et suivi pour sites vitrines autour de Pont-de-Chéruy, Tignieu-Jameyzieu, Crémieu. Réponses simples pour écoles, associations, artisans et TPE.",
  keywords: [
    "faq site web pont-de-chéruy",
    "prix site vitrine isère",
    "délais création site crémieu",
    "questions seo local tpe",
  ],
};

type FaqRepo = {
  faqCategory: {
    findMany: (...args: any[]) => Promise<any>;
    createMany: (...args: any[]) => Promise<any>;
  };
  faq: {
    findMany: (...args: any[]) => Promise<any>;
  };
};
const faqRepo = prisma as unknown as FaqRepo;
type Category = { id: string; name: string; order: number };
type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  createdAt: Date;
  categoryId?: string | null;
  category?: Category;
};

async function getData() {
  const canQuery =
    process.env.NODE_ENV === "test" || Boolean(process.env.DATABASE_URL);
  if (!canQuery) {
    return { categories: [], faqs: [], dbError: true };
  }

  let categories = await faqRepo.faqCategory.findMany({
    orderBy: { order: "asc" },
  } as never);
  if (categories.length === 0) {
    await faqRepo.faqCategory.createMany({
      data: [
        { name: "Général", order: 1 },
        { name: "Méthode & organisation", order: 2 },
        { name: "Technique & sécurité", order: 3 },
        { name: "Après la mise en ligne", order: 4 },
      ],
    });
    categories = await faqRepo.faqCategory.findMany({
      orderBy: { order: "asc" },
    } as never);
  }

  const faqs = (await faqRepo.faq.findMany({
    orderBy: [{ category: { order: "asc" } }, { createdAt: "desc" }],
    include: { category: true },
  } as never)) as FaqEntry[];

  return { categories, faqs, dbError: false };
}

export default async function FAQPage() {
  const { categories, faqs, dbError } = await getData();

  const grouped =
    (categories as Category[]).map((cat) => ({
      ...cat,
      items: faqs.filter(
        (faq) => (faq.categoryId ?? faq.category?.id) === cat.id,
      ),
    })) ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9fc] via-white to-[#edf1ff] text-[#111827]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,91,255,0.12),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.12),transparent_20%),radial-gradient(circle_at_60%_80%,rgba(200,243,211,0.16),transparent_25%)] blur-3xl" />

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1b2653] via-[#24337a] to-[#3b5bff] px-6 py-10 text-white shadow-[0_25px_80px_-35px_rgba(0,0,0,0.55)] sm:px-10 sm:py-12 lg:px-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_30%),linear-gradient(120deg,rgba(255,255,255,0.08),transparent_40%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                Questions fréquentes
              </p>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Tout ce que vous vous demandez avant de lancer votre site web.
              </h1>
              <p className="text-lg text-white/90">
                Tarifs, délais, méthode, technique, suivi : je réponds aux
                questions que se posent les écoles, associations, artisans et
                TPE. Sans jargon, pour vous rassurer avant le premier échange.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border border-white/30 px-3 py-1">
                  Clarté & pédagogie
                </span>
                <span className="rounded-full border border-white/30 px-3 py-1">
                  SEO-friendly
                </span>
                <span className="rounded-full border border-white/30 px-3 py-1">
                  Adapté aux projets locaux
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/faq#questions"
                  className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-white px-5 py-3 text-sm font-semibold text-[#1b2653] shadow-[0_12px_30px_rgba(59,91,255,0.25)] transition hover:bg-[#f2f4ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B5BFF]"
                >
                  Poser une question
                </Link>
                <Link
                  href="/methode"
                  className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Voir ma méthode
                </Link>
              </div>
            </div>
            <div className="relative rounded-3xl border border-white/30 bg-white/10 p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                Pourquoi une FAQ ?
              </p>
              <ul className="mt-4 space-y-3 text-white/90">
                <li className="flex gap-3">
                  <span>✅</span>
                  <span>
                    Lever les freins avant contact : coûts, délais,
                    accompagnement.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span>🔍</span>
                  <span>
                    SEO : capter les recherches locales (prix, site vitrine,
                    école, association).
                  </span>
                </li>
                <li className="flex gap-3">
                  <span>🤝</span>
                  <span>
                    Différenciation : expliquer simplement, sans jargon
                    technique.
                  </span>
                </li>
              </ul>
              <p className="mt-4 rounded-2xl bg-white/10 p-3 text-sm text-white/90">
                Vous ne voyez pas votre question ? Contactez-moi, je vous
                réponds sous 24h.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        {dbError ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Les questions fréquentes ne sont pas disponibles pour le moment
            (base de données non configurée).
          </div>
        ) : null}
        <div className="grid gap-8 lg:grid-cols-[1fr_0.6fr]">
          <div>
            {grouped.map((group) => (
              <div
                key={group.id}
                className="mb-8 rounded-3xl border border-[#e5e7eb] bg-white/90 p-6 shadow-[0_16px_50px_-32px_rgba(27,38,83,0.3)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-[#1b2653]">
                    {group.name}
                  </h2>
                  <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-semibold text-[#3b5bff]">
                    {group.items.length} réponses
                  </span>
                </div>
                <div className="mt-4 space-y-4">
                  {group.items.map((faq) => (
                    <div
                      key={faq.id}
                      className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-[0_10px_30px_-24px_rgba(27,38,83,0.25)]"
                    >
                      <h3 className="text-base font-semibold text-[#1b2653]">
                        {faq.question}
                      </h3>
                      <p className="mt-2 text-sm text-[#374151] whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                  {group.items.length === 0 ? (
                    <p className="text-sm text-[#6b7280]">
                      Ajoutez des questions dans le dashboard.
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-[#eef2ff] via-white to-[#e0f2fe] p-6 shadow-[0_14px_40px_-28px_rgba(27,38,83,0.32)]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1b2653]">
                Besoin d&apos;en savoir plus ?
              </p>
              <p className="mt-2 text-sm text-[#374151]">
                Je réponds sous 24h, et j’adapte mes explications à votre
                réalité (école, association, artisan, TPE).
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/rendezvous"
                  className="inline-flex items-center justify-center rounded-[12px] bg-[#1b2653] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(27,38,83,0.3)] transition hover:bg-[#24337a]"
                >
                  Prendre un rendez-vous
                </Link>
                <Link
                  href="/methode"
                  className="inline-flex items-center justify-center rounded-[12px] border border-[#cbd5e1] px-4 py-2 text-sm font-semibold text-[#1b2653] transition hover:bg-[#f8fafc]"
                >
                  Voir ma méthode
                </Link>
              </div>
            </div>
            <div
              id="questions"
              className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-[0_14px_40px_-28px_rgba(27,38,83,0.32)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1b2653]">
                Pourquoi cette FAQ ?
              </p>
              <ul className="mt-3 space-y-2 text-sm text-[#374151]">
                <li>Des réponses directes pour préparer votre projet.</li>
                <li>
                  Du vocabulaire simple, rien de technique ou de marketing.
                </li>
                <li>
                  Des exemples concrets sur les prix, délais et accompagnements.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
