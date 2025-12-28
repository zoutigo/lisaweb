export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import QuoteWizard from "./quote-wizard";

export default async function DemandeDevisPage() {
  const session = await getServerSession(authOptions);
  const [offersRaw, options] = await Promise.all([
    prisma.serviceOffer.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        shortDescription: true,
        priceLabel: true,
        offerOptions: { select: { id: true } },
      },
    }),
    prisma.offerOption.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        pricingType: true,
        priceCents: true,
        priceFromCents: true,
        unitLabel: true,
        unitPriceCents: true,
      },
    }),
  ]);

  const offers = offersRaw.map((offer) => ({
    id: offer.id,
    title: offer.title,
    shortDescription: offer.shortDescription,
    priceLabel: offer.priceLabel,
    includedOptionIds: offer.offerOptions.map((o) => o.id),
  }));

  return (
    <QuoteWizard
      initialUser={{
        email: session?.user?.email ?? "",
        firstName: (session?.user as { firstName?: string })?.firstName ?? "",
        lastName: (session?.user as { lastName?: string })?.lastName ?? "",
        phone: (session?.user as { phone?: string })?.phone ?? "",
      }}
      offers={offers}
      options={options}
      isAuthenticated={Boolean(session?.user?.email)}
    />
  );
}
