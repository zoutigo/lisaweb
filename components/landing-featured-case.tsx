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
  result1?: string | null;
  result2?: string | null;
  result3?: string | null;
  result4?: string | null;
  result5?: string | null;
  feature1?: string | null;
  feature2?: string | null;
  feature3?: string | null;
  feature4?: string | null;
  feature5?: string | null;
};

type Props = {
  initialCase: LandingCase | null;
};

const FALLBACK_RESULTS = [
  "Navigation simplifiée pour les parents",
  "Informations accessibles rapidement",
  "Site optimisé mobile et ordinateur",
  "Augmentation de la visibilité en ligne",
];

const FALLBACK_FEATURES = [
  "Navigation claire",
  "Design moderne",
  "SEO local",
  "Mobile first",
];

export function LandingFeaturedCase({ initialCase }: Props) {
  const { data } = useQuery<LandingCase | null>({
    queryKey: ["landing-case"],
    queryFn: async () => {
      const res = await fetch("/api/customer-cases/featured", {
        cache: "no-store",
      });
      if (!res.ok) return initialCase ?? null;
      return (await res.json()) as LandingCase | null;
    },
    initialData: initialCase,
    staleTime: 1000 * 60 * 60, // 1h : pas de refetch fréquent
  });

  const caseData = data ?? initialCase;
  const caseResults = [
    caseData?.result1,
    caseData?.result2,
    caseData?.result3,
    caseData?.result4,
    caseData?.result5,
  ].filter(Boolean);
  const caseFeatures = [
    caseData?.feature1,
    caseData?.feature2,
    caseData?.feature3,
    caseData?.feature4,
    caseData?.feature5,
  ].filter(Boolean);

  const caseTitle =
    caseData?.title || "Un site moderne et clair pour une école locale";
  const caseCustomer =
    caseData?.customer || "École Saint-Augustin de Crémieu (exemple local)";
  const caseDescription =
    caseData?.description ||
    "Refonte complète : navigation simplifiée, design moderne, informations accessibles.";
  const caseImage = caseData?.imageUrl || "/images/st-augustin.png";
  const caseUrl = caseData?.url || undefined;

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#e5e9ff] to-[#e8d9ff] p-8 shadow-[0_18px_50px_-24px_rgba(59,91,255,0.35)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,91,255,0.18),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(232,217,255,0.22),transparent_30%)]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
        <div className="flex-1 space-y-4">
          <Badge className="bg-white text-[#1b2653]">Cas client</Badge>
          <h3 className="text-3xl font-semibold text-[#1b2653]">{caseTitle}</h3>
          <p className="text-base text-[#374151]">{caseCustomer}</p>
          <p className="text-base text-[#374151]">{caseDescription}</p>
          <div className="space-y-2 rounded-2xl bg-white/60 p-4 text-sm text-[#1b2653] shadow-[0_10px_28px_-22px_rgba(27,38,83,0.45)]">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#3b5bff]">
              Résultat
            </p>
            <ul className="space-y-1.5">
              {(caseResults.length ? caseResults : FALLBACK_RESULTS).map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#3b5bff] text-[10px] font-bold text-white">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-[#1b2653]">
            {(caseFeatures.length ? caseFeatures : FALLBACK_FEATURES).map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full bg-white/80 px-3 py-1 shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                >
                  {item}
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
        <div className="flex-1">
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
