"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";
import { Pagination } from "@/components/ui/pagination";

type CustomerCase = {
  id: string;
  title: string;
  customer?: string;
  description: string;
  url?: string;
  imageUrl?: string;
  results?: { label: string; id: string; slug: string }[];
  features?: { label: string; id: string; slug: string }[];
  createdAt?: string;
};

const FALLBACK_RESULTS = [
  "Navigation claire et rapide",
  "Informations clés visibles en 1 clic",
  "Site optimisé mobile et SEO local",
  "Parcours utilisateurs simplifié",
];

const FALLBACK_FEATURES = [
  "Design moderne",
  "SEO local",
  "Mobile first",
  "Accompagnement humain",
];

function CaseCard({ item }: { item: CustomerCase }) {
  const caseResults = item.results?.map((r) => r.label).filter(Boolean) ?? [];
  const caseFeatures = item.features?.map((f) => f.label).filter(Boolean) ?? [];

  const image = item.imageUrl || "/images/st-augustin.png";

  return (
    <article className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#e5e9ff] to-[#e8d9ff] p-6 shadow-[0_18px_50px_-24px_rgba(59,91,255,0.35)] sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(59,91,255,0.12),transparent_28%),radial-gradient(circle_at_82%_0%,rgba(232,217,255,0.16),transparent_30%)]" />
      <div className="relative flex flex-col gap-6 lg:gap-8">
        <div className="order-1 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Badge className="bg-white text-[#1b2653]">Cas client</Badge>
            {item.customer ? (
              <span className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">
                {item.customer}
              </span>
            ) : null}
          </div>
          <h3 className="text-2xl font-semibold text-[#1b2653]">
            {item.title}
          </h3>
          <p className="text-base text-[#374151]">{item.description}</p>
        </div>

        <div className="order-2 grid gap-4 lg:grid-cols-[0.52fr_0.48fr] lg:items-start lg:gap-6">
          <div className="overflow-hidden rounded-[18px] border border-white/50 bg-white/90 shadow-[0_14px_40px_-26px_rgba(27,38,83,0.4)]">
            <Image
              src={image}
              alt={item.title}
              width={1200}
              height={800}
              className="h-full w-full object-cover"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 46vw"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="space-y-3 rounded-2xl bg-white/80 p-4 text-sm text-[#1b2653] shadow-[0_10px_28px_-22px_rgba(27,38,83,0.45)]">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3b5bff]">
                Résultats
              </p>
              <ul className="space-y-1.5">
                {(caseResults.length ? caseResults : FALLBACK_RESULTS).map(
                  (val) => (
                    <li key={val} className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#3b5bff] text-[10px] font-bold text-white">
                        ✓
                      </span>
                      <span>{val}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2 rounded-2xl bg-white/80 p-4 text-sm text-[#1b2653] shadow-[0_10px_28px_-22px_rgba(27,38,83,0.45)]">
              {(caseFeatures.length ? caseFeatures : FALLBACK_FEATURES).map(
                (val) => (
                  <span
                    key={val}
                    className="rounded-full bg-white px-3 py-1 shadow-[0_8px_18px_-16px_rgba(0,0,0,0.4)]"
                  >
                    {val}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="order-3 flex flex-wrap gap-3">
          {item.url ? (
            <Link href={item.url} target="_blank" className="w-fit">
              <Button variant="secondary" className="w-fit">
                Voir la réalisation
              </Button>
            </Link>
          ) : (
            <Button variant="secondary" className="w-fit" disabled>
              Voir la réalisation
            </Button>
          )}
          <Link href="/rendezvous" className="w-fit">
            <Button variant="primary" className="w-fit">
              Discutons de votre projet
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function RealisationsClient({
  initialCases,
}: {
  initialCases: CustomerCase[];
}) {
  const [page, setPage] = useState(1);
  const pageSize = 3;

  const { data } = useQuery<CustomerCase[]>({
    queryKey: ["customer-cases-public"],
    queryFn: async () => {
      const res = await fetch("/api/customer-cases", {
        next: { revalidate: 300 },
        cache: "force-cache",
      });
      if (!res.ok) return initialCases;
      return (await res.json()) as CustomerCase[];
    },
    initialData: initialCases,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const cases = data ?? initialCases;
  const totalPages = Math.max(1, Math.ceil((cases?.length ?? 0) / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedCases = useMemo(
    () => cases.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [cases, currentPage],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9fc] via-white to-[#eef2ff] text-[#111827]">
      <section className="relative mx-auto w-full max-w-6xl px-6 py-16 sm:px-8 pt-12 sm:pt-16">
        <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1b2653] to-[#3b5bff] px-6 py-10 text-white shadow-[0_25px_80px_-35px_rgba(0,0,0,0.55)] sm:px-12 sm:py-12">
          <div className="flex flex-col gap-4 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.26em] text-white/70">
              Réalisations
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Les projets qui font la différence
            </h1>
            <p className="text-lg text-white/85">
              Une sélection de cas clients concrets, avec les résultats clés et
              les fonctionnalités qui ont compté.
            </p>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-6 pb-16 sm:px-8">
        <SectionHeading
          eyebrow="Portfolio"
          title="Réalisations et cas clients"
          description="Mises en ligne récentes, classées du plus récent au plus ancien."
          align="left"
        />
        {cases.length === 0 ? (
          <p className="mt-6 text-sm text-[#4b5563]">
            Aucun cas client pour le moment.
          </p>
        ) : (
          <div className="mt-6 space-y-6">
            {paginatedCases.map((item) => (
              <CaseCard key={`${item.id}-${currentPage}`} item={item} />
            ))}
            {cases.length > pageSize ? (
              <div className="flex justify-center pt-2">
                <Pagination
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalCount={cases.length}
                  onPageChange={setPage}
                />
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
