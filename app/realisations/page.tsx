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
    result1: true;
    result2: true;
    result3: true;
    result4: true;
    result5: true;
    feature1: true;
    feature2: true;
    feature3: true;
    feature4: true;
    feature5: true;
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
        result1: true,
        result2: true,
        result3: true,
        result4: true,
        result5: true,
        feature1: true,
        feature2: true,
        feature3: true,
        feature4: true,
        feature5: true,
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
    result1: item.result1 ?? undefined,
    result2: item.result2 ?? undefined,
    result3: item.result3 ?? undefined,
    result4: item.result4 ?? undefined,
    result5: item.result5 ?? undefined,
    feature1: item.feature1 ?? undefined,
    feature2: item.feature2 ?? undefined,
    feature3: item.feature3 ?? undefined,
    feature4: item.feature4 ?? undefined,
    feature5: item.feature5 ?? undefined,
    createdAt:
      item.createdAt instanceof Date
        ? item.createdAt.toISOString()
        : String(item.createdAt),
  }));

  return <RealisationsClient initialCases={initialCases} />;
}
