/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { OfferOptionForm } from "../../offer-option-form";

export default async function EditOfferOptionPage({
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

  const option = await prisma.offerOption.findUnique({ where: { id } });
  if (!option) redirect("/dashboard/offer-options");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <BackLink className="mb-4" />
      <OfferOptionForm
        mode="edit"
        initialOption={{
          ...option,
          priceCents: option.priceCents ?? undefined,
          priceFromCents: option.priceFromCents ?? undefined,
          unitPriceCents: option.unitPriceCents ?? undefined,
          constraintsJson: option.constraintsJson ?? undefined,
          unitLabel: option.unitLabel ?? undefined,
          durationDays: (option as any).durationDays ?? 2,
        }}
      />
    </div>
  );
}
