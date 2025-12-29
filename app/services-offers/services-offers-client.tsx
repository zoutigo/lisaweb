"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Offer = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  shortDescription: string;
  targetAudience: string;
  priceLabel: string;
  durationLabel: string;
  engagementLabel: string;
  ctaLabel: string;
  ctaLink: string;
  isFeatured: boolean;
  features: { id: string; label: string; icon?: string | null }[];
  steps: { id: string; title: string; description: string; order?: number }[];
  useCases?: unknown[];
  offerOptions: { id: string; title: string; slug: string }[];
};

async function fetchOffers(): Promise<Offer[]> {
  const res = await fetch("/api/service-offers", { cache: "no-store" });
  if (!res.ok) throw new Error("Erreur de chargement des offres");
  return res.json();
}

export default function ServicesOffersClient({
  initialOffers,
}: {
  initialOffers: Offer[];
}) {
  const { data } = useQuery({
    queryKey: ["service-offers"],
    queryFn: async () => {
      const json = await fetchOffers();
      return json.map((o) => ({
        ...o,
        offerOptions: o.offerOptions ?? [],
      }));
    },
    initialData: useMemo(
      () =>
        initialOffers.map((o) => ({
          ...o,
          offerOptions: o.offerOptions ?? [],
        })),
      [initialOffers],
    ),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  const offers = data ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9fc] via-white to-[#eef2ff] text-[#111827]">
      <main>
        <Section className="pt-12 sm:pt-16">
          <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1b2653] to-[#3b5bff] px-6 py-10 text-white shadow-[0_25px_80px_-35px_rgba(0,0,0,0.55)] sm:px-12 sm:py-12">
            <div className="flex flex-col gap-4 max-w-4xl">
              <p className="text-xs uppercase tracking-[0.26em] text-white/70">
                Formats d&apos;accompagnement
              </p>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Des offres claires pour avancer sereinement
              </h1>
              <p className="text-lg text-white/85">
                Site vitrine clé en main, refonte ou accompagnement continu :
                choisissez le rythme et le cadre qui correspondent à votre
                projet.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-white/80">
                <span className="rounded-full border border-white/30 px-3 py-1">
                  Réponse rapide
                </span>
                <span className="rounded-full border border-white/30 px-3 py-1">
                  Pédagogie & proximité
                </span>
                <span className="rounded-full border border-white/30 px-3 py-1">
                  Sans jargon inutile
                </span>
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <SectionHeading
            eyebrow="Offres disponibles"
            title="Trois formats pour couvrir vos besoins"
            description="Chaque carte détaille les points clés, la cible et un aperçu du déroulé. Toutes les offres sont modulables."
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {offers.map((offer) => (
              <Card
                key={offer.id}
                className="flex h-full flex-col gap-4 border border-[#e5e7eb] bg-white/95 p-6 shadow-[0_16px_50px_-32px_rgba(27,38,83,0.4)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_-35px_rgba(27,38,83,0.5)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6b7280]">
                      {offer.slug}
                    </p>
                    <h2 className="text-2xl font-semibold text-[#1b2653]">
                      {offer.title}
                    </h2>
                    {offer.subtitle ? (
                      <p className="text-base font-medium text-[#1b2653]/90">
                        {offer.subtitle}
                      </p>
                    ) : null}
                  </div>
                  {offer.isFeatured ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Mis en avant
                    </span>
                  ) : null}
                </div>

                <p className="text-sm text-[#374151]">
                  {offer.shortDescription}
                </p>

                <div className="flex flex-wrap gap-2 text-xs text-[#1b2653]">
                  <span className="rounded-full bg-[#f3f4f6] px-3 py-1">
                    {offer.targetAudience}
                  </span>
                  <span className="rounded-full bg-[#f3f4f6] px-3 py-1">
                    {offer.durationLabel}
                  </span>
                  <span className="rounded-full bg-[#f3f4f6] px-3 py-1">
                    {offer.priceLabel}
                  </span>
                  <span className="rounded-full bg-[#f3f4f6] px-3 py-1">
                    {offer.engagementLabel}
                  </span>
                </div>

                {offer.offerOptions.length ? (
                  <div className="grid gap-2 rounded-2xl bg-[#f0fdf4] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#15803d]">
                      Options incluses
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {offer.offerOptions.map((opt) => (
                        <span
                          key={opt.id}
                          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#166534] shadow-sm"
                        >
                          🧩 {opt.title}
                          <span className="text-[10px] text-[#4b5563]">
                            ({opt.slug})
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {offer.features.length ? (
                  <div className="grid gap-2 rounded-2xl bg-[#f9fafb] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6b7280]">
                      Points clés
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {offer.features.slice(0, 6).map((feature) => (
                        <div
                          key={feature.id}
                          className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm"
                        >
                          <span className="text-lg">
                            {feature.icon ?? "✅"}
                          </span>
                          <p className="text-sm text-[#1f2937]">
                            {feature.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {offer.steps.length ? (
                  <div className="grid gap-2 rounded-2xl bg-[#f0f4ff] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#3b5bff]">
                      Déroulé
                    </p>
                    <ol className="space-y-2 text-sm text-[#1f2937]">
                      {offer.steps.slice(0, 4).map((step, idx) => (
                        <li
                          key={step.id}
                          className="flex gap-2 rounded-lg bg-white/80 p-2"
                        >
                          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#3b5bff]/10 text-xs font-semibold text-[#1b2653]">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-[#1b2653]">
                              {step.title}
                            </p>
                            <p className="text-sm text-[#4b5563]">
                              {step.description}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
                  <Link href="/demande-devis">
                    <Button className="shadow-[0_12px_30px_rgba(59,91,255,0.25)]">
                      {offer.ctaLabel}
                    </Button>
                  </Link>
                  <Link href="/rendezvous">
                    <Button variant="secondary">Prendre un rendez-vous</Button>
                  </Link>
                </div>
              </Card>
            ))}
            {offers.length === 0 ? (
              <Card className="border border-dashed border-[#e5e7eb] bg-white/80 p-6 text-center text-sm text-[#4b5563]">
                Aucune offre enregistrée pour le moment.
              </Card>
            ) : null}
          </div>
        </Section>
      </main>
    </div>
  );
}
