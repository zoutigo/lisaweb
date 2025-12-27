export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ServiceOfferDetailPage({
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

  const features = offer.features ?? [];
  const steps = offer.steps ?? [];
  const useCases = offer.useCases ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between">
        <BackLink />
        <Link href={`/dashboard/service-offers/${offer.id}/edit`}>
          <Button className="h-9 px-4 text-sm">Modifier</Button>
        </Link>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
          Offre
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{offer.title}</h1>
        <p className="text-sm text-gray-700">{offer.slug}</p>
        {offer.shortDescription ? (
          <p className="mt-3 text-sm text-gray-800">{offer.shortDescription}</p>
        ) : null}
        {offer.longDescription ? (
          <p className="mt-2 text-sm text-gray-800">{offer.longDescription}</p>
        ) : null}

        {features.length ? (
          <div className="mt-6 space-y-2 rounded-xl bg-[#f8f9ff] p-4 text-sm text-gray-900">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3b5bff]">
              Features
            </p>
            <ul className="space-y-1.5">
              {features.map((f) => (
                <li key={f.id} className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#3b5bff] text-[10px] font-bold text-white">
                    ✓
                  </span>
                  <span>
                    {f.label} {f.icon ? `(${f.icon})` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {steps.length ? (
          <div className="mt-4 space-y-2 rounded-xl bg-[#f0f4ff] p-4 text-sm text-gray-900">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3b5bff]">
              Étapes
            </p>
            <ol className="list-decimal space-y-1 pl-4">
              {steps
                .slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((s) => (
                  <li key={s.id}>
                    <span className="font-semibold">{s.title}</span>:{" "}
                    <span>{s.description}</span>
                  </li>
                ))}
            </ol>
          </div>
        ) : null}

        {useCases.length ? (
          <div className="mt-4 space-y-2 rounded-xl bg-[#f0f4ff] p-4 text-sm text-gray-900">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3b5bff]">
              Cas d&apos;usage
            </p>
            <ul className="space-y-1.5">
              {useCases.map((u) => (
                <li key={u.id}>
                  <span className="font-semibold">{u.title}</span>:{" "}
                  <span>{u.description}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
