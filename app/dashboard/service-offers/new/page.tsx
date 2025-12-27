export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { ServiceOfferForm } from "../service-offer-form";

export default async function NewServiceOfferPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean((session?.user as { isAdmin?: boolean })?.isAdmin);
  if (!session || !session.user?.email || !isAdmin) redirect("/");

  const offerOptions = await prisma.offerOption.findMany({
    orderBy: { order: "asc" },
    select: { id: true, title: true, slug: true },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <BackLink className="mb-4" />
      <ServiceOfferForm mode="create" availableOptions={offerOptions} />
    </div>
  );
}
