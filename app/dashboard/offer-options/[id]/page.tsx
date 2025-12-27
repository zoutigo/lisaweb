export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { ActionIconButton } from "@/components/ui/action-icon-button";

export default async function OfferOptionDetailPage({
  params,
}: {
  params: { id?: string } | Promise<{ id?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean((session?.user as { isAdmin?: boolean })?.isAdmin);
  if (!session || !session.user?.email || !isAdmin) redirect("/");

  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;
  if (!id || typeof id !== "string") redirect("/dashboard/offer-options");

  const option = await prisma.offerOption.findUnique({
    where: { id },
  });
  if (!option) redirect("/dashboard/offer-options");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between">
        <BackLink />
        <ActionIconButton
          as="link"
          action="edit"
          label="Modifier"
          tone="primary"
          href={`/dashboard/offer-options/${option.id}/edit`}
        />
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
          Option d&apos;offre
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {option.title}
        </h1>
        <p className="text-sm text-gray-700">{option.slug}</p>
        <p className="mt-3 text-sm text-gray-800">{option.descriptionShort}</p>
        <p className="mt-2 text-sm text-gray-800">{option.descriptionLong}</p>
        <div className="mt-4 text-sm text-gray-800">
          <p>Type: {option.pricingType}</p>
          {option.priceCents ? <p>Prix: {option.priceCents} cents</p> : null}
          {option.priceFromCents ? (
            <p>À partir de: {option.priceFromCents} cents</p>
          ) : null}
          {option.unitLabel ? <p>Unité: {option.unitLabel}</p> : null}
          {option.unitPriceCents ? (
            <p>Prix unitaire: {option.unitPriceCents} cents</p>
          ) : null}
          <p>Populaire: {option.isPopular ? "Oui" : "Non"}</p>
          {option.constraintsJson ? (
            <p>Contraintes: {option.constraintsJson}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
