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
  results: { id: string; label: string; slug: string }[];
  features: { id: string; label: string; slug: string }[];
  imageUrl: string | null;
  createdAt: Date;
  isFeatured: boolean;
};

export default async function CustomersCasesPage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session || !session.user?.email) redirect("/");
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;
  if (!isAdmin) redirect("/");

  const cases = (await prisma.customerCase.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      results: true,
      features: true,
    },
  })) as CustomerCase[];

  return (
    <CustomersCasesClient
      initialCases={cases.map((c) => ({
        ...c,
        isFeatured: c.isFeatured ?? false,
        customer: c.customer ?? undefined,
        url: c.url ?? undefined,
        imageUrl: c.imageUrl ?? undefined,
        results: c.results ?? [],
        features: c.features ?? [],
        createdAt: c.createdAt.toISOString(),
      }))}
    />
  );
}
