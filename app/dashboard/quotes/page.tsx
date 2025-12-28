export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import QuotesClient from "./quotes-client";

export default async function QuotesPage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session || !session.user?.email) redirect("/");
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;
  if (!isAdmin) redirect("/");

  const quotes = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      serviceOffer: true,
      offerOptions: true,
    },
  });

  return <QuotesClient initialQuotes={quotes} />;
}
