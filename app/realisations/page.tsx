export const runtime = "nodejs";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import RealisationsClient from "./realisations-client";

export const metadata = {
  title: "Réalisations",
  description:
    "Découvrez les projets client récents : résultats, fonctionnalités clés et liens vers les sites livrés.",
};

type CustomerCasePayload = Prisma.CustomerCaseGetPayload<{
  select: {
    id: true;
    title: true;
    customer: true;
    description: true;
    url: true;
    imageUrl: true;
    results: true;
    features: true;
    createdAt: true;
  };
}>;

export default async function RealisationsPage() {
  let customerCases: CustomerCasePayload[] = [];
  try {
    customerCases = await prisma.customerCase.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        customer: true,
        description: true,
        url: true,
        imageUrl: true,
        results: true,
        features: true,
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
