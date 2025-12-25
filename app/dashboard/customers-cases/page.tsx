export const runtime = "nodejs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import CustomersCasesClient from "./customers-cases-client";

type CustomerCase = {
  id: string;
  title: string;
  customer: string | null;
  description: string;
  url: string | null;
  result1: string | null;
  result2: string | null;
  result3: string | null;
  result4: string | null;
  result5: string | null;
  feature1: string | null;
  feature2: string | null;
  feature3: string | null;
  feature4: string | null;
  feature5: string | null;
  imageUrl: string | null;
  createdAt: Date;
  isOnLandingPage: boolean;
};

export default async function CustomersCasesPage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session || !session.user?.email) redirect("/");
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;
  if (!isAdmin) redirect("/");

  const cases = (await prisma.customerCase.findMany({
    orderBy: { createdAt: "desc" },
  })) as CustomerCase[];

  return (
    <CustomersCasesClient
      initialCases={cases.map((c) => ({
        ...c,
        isOnLandingPage: c.isOnLandingPage ?? false,
        customer: c.customer ?? undefined,
        url: c.url ?? undefined,
        imageUrl: c.imageUrl ?? undefined,
        result1: c.result1 ?? undefined,
        result2: c.result2 ?? undefined,
        result3: c.result3 ?? undefined,
        result4: c.result4 ?? undefined,
        result5: c.result5 ?? undefined,
        feature1: c.feature1 ?? undefined,
        feature2: c.feature2 ?? undefined,
        feature3: c.feature3 ?? undefined,
        feature4: c.feature4 ?? undefined,
        feature5: c.feature5 ?? undefined,
        createdAt: c.createdAt.toISOString(),
      }))}
    />
  );
}
