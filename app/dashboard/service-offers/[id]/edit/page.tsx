export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { ServiceOfferForm } from "../../service-offer-form";

export default async function EditServiceOfferPage({
  params,
}: {
  params: { id?: string } | Promise<{ id?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean((session?.user as { isAdmin?: boolean })?.isAdmin);
  if (!session || !session.user?.email || !isAdmin) redirect("/");

  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;
  if (!id || typeof id !== "string") redirect("/dashboard/service-offers");

  const offer = await prisma.serviceOffer.findUnique({
    where: { id },
    include: { features: true, steps: true, useCases: true },
  });
  if (!offer) redirect("/dashboard/service-offers");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <BackLink className="mb-4" />
      <ServiceOfferForm
        mode="edit"
        initialOffer={{
          ...offer,
          subtitle: offer.subtitle ?? undefined,
          features:
            offer.features?.map((f, idx) => ({
              id: f.id,
              label: f.label,
              icon: f.icon ?? undefined,
              order: f.order ?? idx,
            })) ?? [],
          steps:
            offer.steps?.map((s, idx) => ({
              id: s.id,
              title: s.title,
              description: s.description,
              order: s.order ?? idx,
            })) ?? [],
          useCases:
            offer.useCases?.map((u) => ({
              id: u.id,
              title: u.title,
              description: u.description,
            })) ?? [],
        }}
      />
    </div>
  );
}
