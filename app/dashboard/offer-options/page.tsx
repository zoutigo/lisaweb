/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import OfferOptionsClient from "./offer-options-client";

type OfferOption = {
  id: string;
  slug: string;
  title: string;
  descriptionShort: string;
  pricingType: string;
  priceCents: number | null;
  priceFromCents: number | null;
  unitLabel: string | null;
  unitPriceCents: number | null;
  durationDays?: number;
};

export default async function OfferOptionsPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean((session?.user as { isAdmin?: boolean })?.isAdmin);
  if (!session || !session.user?.email || !isAdmin) redirect("/");

  const options = await prisma.offerOption.findMany({
    orderBy: { order: "asc" },
  });

  const initialOptions: OfferOption[] = options.map((opt) => ({
    id: opt.id,
    slug: opt.slug,
    title: opt.title,
    descriptionShort: opt.descriptionShort,
    pricingType: opt.pricingType,
    priceCents: opt.priceCents ?? null,
    priceFromCents: opt.priceFromCents ?? null,
    unitLabel: opt.unitLabel ?? null,
    unitPriceCents: opt.unitPriceCents ?? null,
    durationDays: (opt as any).durationDays ?? 0,
  }));

  return <OfferOptionsClient initialOptions={initialOptions} />;
}
