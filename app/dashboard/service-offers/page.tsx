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
    include: { features: true, steps: true, useCases: true },
  });

  const initialOffers = offers.map((offer) => ({
    ...offer,
    subtitle: offer.subtitle ?? undefined,
    createdAt:
      offer.createdAt instanceof Date
        ? offer.createdAt.toISOString()
        : String(offer.createdAt),
    updatedAt:
      offer.updatedAt instanceof Date
        ? offer.updatedAt.toISOString()
        : String(offer.updatedAt),
    features: (offer.features ?? []).map((f) => ({
      id: f.id,
      label: f.label,
      icon: f.icon ?? undefined,
      order: f.order ?? undefined,
    })),
    steps: (offer.steps ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      order: s.order ?? undefined,
    })),
    useCases: (offer.useCases ?? []).map((u) => ({
      id: u.id,
      title: u.title,
      description: u.description,
    })),
  })) satisfies Parameters<typeof ServiceOffersClient>[0]["initialOffers"];

  return <ServiceOffersClient initialOffers={initialOffers} />;
}
