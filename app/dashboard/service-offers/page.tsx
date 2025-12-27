export const runtime = "nodejs";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import ServiceOffersClient from "./service-offers-client";

export const metadata = {
  title: "Formats d'accompagnement | Dashboard",
};

export default async function ServiceOffersPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean((session?.user as { isAdmin?: boolean })?.isAdmin);
  if (!session || !session.user?.email || !isAdmin) redirect("/");

  const offers = await prisma.serviceOffer.findMany({
    orderBy: { order: "asc" },
    include: { features: { select: { id: true } } },
  });

  const initialOffers = offers.map((offer) => ({
    id: offer.id,
    slug: offer.slug,
    shortDescription: offer.shortDescription,
    title: offer.title,
    featuresCount: offer.features?.length ?? 0,
  })) satisfies Parameters<typeof ServiceOffersClient>[0]["initialOffers"];

  return <ServiceOffersClient initialOffers={initialOffers} />;
}
