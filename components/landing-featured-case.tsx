"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type LandingCase = {
  id: string;
  title: string;
  customer?: string | null;
  description: string;
  url?: string | null;
  imageUrl?: string | null;
  results?: { id: string; label: string; slug: string }[];
  features?: { id: string; label: string; slug: string }[];
};

type Props = {
  initialCase: LandingCase | null;
};

const FALLBACK_RESULTS: { key: string; label: string }[] = [
  { key: "fallback-res-1", label: "Navigation simplifiée pour les parents" },
  { key: "fallback-res-2", label: "Informations accessibles rapidement" },
  { key: "fallback-res-3", label: "Site optimisé mobile et ordinateur" },
  { key: "fallback-res-4", label: "Augmentation de la visibilité en ligne" },
];

const FALLBACK_FEATURES: { key: string; label: string }[] = [
  { key: "fallback-feat-1", label: "Navigation claire" },
  { key: "fallback-feat-2", label: "Design moderne" },
  { key: "fallback-feat-3", label: "SEO local" },
  { key: "fallback-feat-4", label: "Mobile first" },
];

export function LandingFeaturedCase({ initialCase }: Props) {
  const { data } = useQuery<LandingCase | null>({
    queryKey: ["landing-case"],
    queryFn: async () => {
      const res = await fetch("/api/customer-cases/featured", {
        cache: "no-store",
      });
      if (!res.ok) return null;
      return (await res.json()) as LandingCase | null;
    },
    initialData: initialCase ?? undefined,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });

  const caseData = data ?? initialCase;
  if (!caseData) return null;

  const caseResults =
    caseData.results
      ?.map((r) => ({
        key: r.slug || r.id || r.label,
        label: r.label,
      }))
      .filter((r) => Boolean(r.label)) ?? [];
  const caseFeatures =
    caseData.features
      ?.map((f) => ({
        key: f.slug || f.id || f.label,
        label: f.label,
      }))
      .filter((f) => Boolean(f.label)) ?? [];

  const caseTitle = caseData.title;
  const caseCustomer = caseData.customer;
  const caseDescription = caseData.description;
  const caseImage = caseData.imageUrl || "/images/st-augustin.png";
  const caseUrl = caseData.url || undefined;

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#e5e9ff] to-[#e8d9ff] p-8 shadow-[0_18px_50px_-24px_rgba(59,91,255,0.35)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,91,255,0.18),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(232,217,255,0.22),transparent_30%)]" />
      <div className="relative grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-3 lg:col-span-2">
          <Badge className="bg-white text-[#1b2653]">Cas client</Badge>
          <h3 className="text-3xl font-semibold text-[#1b2653]">{caseTitle}</h3>
          <p className="text-base text-[#374151]">{caseCustomer}</p>
          <p className="text-base text-[#374151]">{caseDescription}</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2 rounded-2xl bg-white/60 p-4 text-sm text-[#1b2653] shadow-[0_10px_28px_-22px_rgba(27,38,83,0.45)]">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#3b5bff]">
              Résultat
            </p>
            <ul className="space-y-1.5">
              {(caseResults.length ? caseResults : FALLBACK_RESULTS).map(
                (item) => (
                  <li key={item.key} className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#3b5bff] text-[10px] font-bold text-white">
                      ✓
                    </span>
                    <span>{item.label}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-[#1b2653]">
            {(caseFeatures.length ? caseFeatures : FALLBACK_FEATURES).map(
              (item) => (
                <span
                  key={item.key}
                  className="rounded-full bg-white/80 px-3 py-1 shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                >
                  {item.label}
                </span>
              ),
            )}
          </div>
          {caseUrl ? (
            <Link href={caseUrl} className="w-fit" target="_blank">
              <Button variant="secondary" className="w-fit">
                Voir la réalisation
              </Button>
            </Link>
          ) : (
            <Button variant="secondary" className="w-fit" disabled>
              Voir la réalisation
            </Button>
          )}
        </div>

        <div className="flex items-center">
          <div className="relative overflow-hidden rounded-[18px] border border-white/50 bg-white/80 shadow-[0_10px_28px_-20px_rgba(27,38,83,0.35)]">
            <Image
              src={caseImage}
              alt="Aperçu du site"
              width={1200}
              height={800}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
