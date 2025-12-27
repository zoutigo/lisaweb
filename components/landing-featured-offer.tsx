import Link from "next/link";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

type Feature = { label: string; icon?: string | null };
type Step = { title: string; description: string };
type Option = { id: string; title: string; slug: string };

export type LandingServiceOffer = {
  title: string;
  subtitle?: string | null;
  shortDescription: string;
  targetAudience: string;
  priceLabel: string;
  durationLabel: string;
  engagementLabel: string;
  ctaLabel: string;
  ctaLink: string;
  features?: Feature[];
  steps?: Step[];
  offerOptions?: Option[];
};

export function LandingFeaturedOffer({
  offer,
}: {
  offer: LandingServiceOffer | null;
}) {
  if (!offer) return null;

  const features = offer.features?.slice(0, 4) ?? [];
  const steps = offer.steps?.slice(0, 4) ?? [];
  const options = offer.offerOptions ?? [];

  return (
    <div className="overflow-hidden rounded-[24px] bg-gradient-to-br from-[#f0f4ff] via-white to-[#e8edff] p-6 shadow-[0_18px_60px_-30px_rgba(27,38,83,0.45)] sm:p-10">
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.24em] text-[#4b5563]">
            Format d&apos;accompagnement
          </p>
          <h2 className="text-3xl font-semibold text-[#1b2653] sm:text-4xl">
            {offer.title}
          </h2>
          {offer.subtitle ? (
            <p className="text-lg font-medium text-[#1b2653]/90">
              {offer.subtitle}
            </p>
          ) : null}
          <p className="text-base text-[#374151]">{offer.shortDescription}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="border-none bg-white/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">
                Pour qui ?
              </p>
              <p className="mt-1 text-sm font-semibold text-[#1b2653]">
                {offer.targetAudience}
              </p>
            </Card>
            <Card className="border-none bg-white/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">
                Durée & budget
              </p>
              <p className="mt-1 text-sm font-semibold text-[#1b2653]">
                {offer.durationLabel}
              </p>
              <p className="text-sm text-[#1b2653]">{offer.priceLabel}</p>
            </Card>
          </div>

          {options.length ? (
            <div className="rounded-2xl bg-[#eef2ff] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#3b5bff]">
                Options incluses
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {options.map((opt) => (
                  <span
                    key={opt.id}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1b2653] shadow-sm"
                  >
                    🧩 {opt.title}
                    <span className="text-[10px] text-[#6b7280]">
                      ({opt.slug})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 text-sm text-[#1b2653]">
            <span className="rounded-full bg-white px-3 py-1 shadow-sm">
              {offer.engagementLabel}
            </span>
            <span className="rounded-full bg-white px-3 py-1 shadow-sm">
              Projet guidé & pédagogique
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href={offer.ctaLink}>
              <Button className="shadow-[0_12px_30px_rgba(59,91,255,0.25)]">
                {offer.ctaLabel}
              </Button>
            </Link>
            <span className="text-sm text-[#4b5563]">
              Réponse rapide, sans engagement
            </span>
          </div>

          <div className="mt-2">
            <Link
              href="/services-offers"
              className="text-sm font-semibold text-[#1b2653] underline-offset-4 hover:underline"
            >
              Découvrir tous les formats →
            </Link>
          </div>
        </div>

        <Card className="border-none bg-white/90 p-6 shadow-md">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">
                Points clés
              </p>
              <p className="text-base font-semibold text-[#1b2653]">
                Ce que vous obtenez
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {features.map((feature) => (
              <div
                key={feature.label}
                className="flex items-start gap-3 rounded-xl bg-[#f7f9fc] p-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg">
                  {feature.icon ?? "✅"}
                </div>
                <p className="text-sm font-medium text-[#1f2937]">
                  {feature.label}
                </p>
              </div>
            ))}
          </div>

          {steps.length ? (
            <div className="mt-6 space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">
                Déroulé
              </p>
              <ol className="space-y-2 text-sm text-[#1f2937]">
                {steps.map((step, index) => (
                  <li
                    key={`${step.title}-${index}`}
                    className="flex gap-2 rounded-lg bg-[#f9fafb] p-2"
                  >
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#3b5bff]/10 text-xs font-semibold text-[#1b2653]">
                      {index + 1}
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
        </Card>
      </div>
    </div>
  );
}
