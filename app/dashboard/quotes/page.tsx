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

  const quotesRaw = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      serviceOffer: true,
      quoteOptions: { include: { option: true } },
    },
  });

  const quotes = quotesRaw.map((q) => ({
    ...q,
    offerOptions: q.quoteOptions.map((qo) => ({
      ...qo.option,
      quantity: qo.quantity,
    })),
  }));

  return <QuotesClient initialQuotes={quotes} />;
}
