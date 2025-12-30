export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { prisma } from "@/lib/prisma";
import RealisationsClient from "./realisations-client";

export const metadata = {
  title:
    "Réalisations web locales | Sites vitrines livrés autour de Pont-de-Chéruy",
  description:
    "Exemples de sites pour écoles, associations, artisans et TPE en Isère (Pont-de-Chéruy, Tignieu, Crémieu) : résultats obtenus, fonctionnalités et liens vers les projets en ligne.",
  keywords: [
    "réalisations site web pont-de-chéruy",
    "exemples site vitrine isère",
    "portfolio développeur tignieu",
  ],
};

type CustomerCasePayload = {
  id: string;
  title: string;
  customer: string | null;
  description: string;
  url: string | null;
  imageUrl: string | null;
  results: { id: string; label: string; slug: string }[];
  features: { id: string; label: string; slug: string }[];
  createdAt: Date;
  isActive?: boolean;
};

export default async function RealisationsPage() {
  let customerCases: CustomerCasePayload[] = [];
  try {
    customerCases = await prisma.customerCase.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        customer: true,
        description: true,
        url: true,
        imageUrl: true,
        results: { select: { id: true, label: true, slug: true } },
        features: { select: { id: true, label: true, slug: true } },
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("Failed to load customer cases", error);
  }

  const initialCases = customerCases.map((item) => ({
    ...item,
    customer: item.customer ?? undefined,
    url: item.url ?? undefined,
    imageUrl: item.imageUrl ?? undefined,
    results: item.results ?? [],
    features: item.features ?? [],
    createdAt:
      item.createdAt instanceof Date
        ? item.createdAt.toISOString()
        : String(item.createdAt),
  }));

  return <RealisationsClient initialCases={initialCases} />;
}
