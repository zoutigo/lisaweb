"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { fallbackFaqs } from "@/lib/data/fallback-faq";

type FaqPreviewItem = {
  id: string;
  question: string;
  answer: string;
  category: { id: string; name: string };
};

type FaqPreviewResponse = {
  categories: Array<{ id: string; name: string; order: number }>;
  faqs: Array<
    FaqPreviewItem & {
      createdAt: string;
      categoryId?: string;
    }
  >;
};

export function LandingFaqPreview() {
  const queryClient = useQueryClient();
  const { data } = useQuery<FaqPreviewResponse>({
    queryKey: ["faq-preview"],
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const res = await fetch("/api/faq", { cache: "no-store" });
      return (await res.json()) as FaqPreviewResponse;
    },
  });

  const faqs = (() => {
    const source =
      data?.faqs && data.faqs.length > 0 ? data.faqs : fallbackFaqs;
    const picked: FaqPreviewItem[] = [];
    const seen = new Set<string>();
    for (const faq of source) {
      const catId = faq.category?.id;
      if (catId && !seen.has(catId)) {
        picked.push(faq);
        seen.add(catId);
      }
      if (picked.length === 3) break;
    }
    return picked;
  })();

  // expose an invalidate helper (can be used via queryClient.invalidateQueries in dashboard)
  queryClient.getQueryCache();

  return (
    <>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {faqs.map((item) => (
          <Card
            key={item.id}
            className="flex flex-col gap-2 border border-[#e5e7eb] bg-white shadow-[0_10px_30px_-24px_rgba(27,38,83,0.28)]"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
              {item.category?.name}
            </span>
            <h3 className="text-lg font-semibold text-[#1b2653]">
              {item.question}
            </h3>
            <p className="text-sm text-[#374151]">{item.answer}</p>
          </Card>
        ))}
      </div>
      <div className="mt-6">
        <Link
          href="/faq"
          className="inline-flex items-center gap-2 text-[#1b2653] font-semibold hover:underline"
        >
          Voir toutes les questions fréquentes →
        </Link>
      </div>
    </>
  );
}
