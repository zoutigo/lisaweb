export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BackLink } from "@/components/back-link";
import { Button } from "@/components/ui/button";

export default async function CustomerCaseDetailPage({
  params,
}: {
  params: { id?: string } | Promise<{ id?: string }>;
}) {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session || !session.user?.email) redirect("/");
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;
  if (!isAdmin) redirect("/");

  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;
  if (!id || typeof id !== "string") {
    redirect("/dashboard/customers-cases");
  }

  const customerCase = await prisma.customerCase.findUnique({
    where: { id },
    include: { results: true, features: true },
  });
  if (!customerCase) redirect("/dashboard/customers-cases");

  const results = customerCase.results ?? [];
  const features = customerCase.features ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between">
        <BackLink />
        <Link href={`/dashboard/customers-cases/${customerCase.id}/edit`}>
          <Button className="h-9 px-4 text-sm">Modifier</Button>
        </Link>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
          Fiche cas client
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {customerCase.title}
        </h1>
        {customerCase.customer ? (
          <p className="text-sm text-gray-700">{customerCase.customer}</p>
        ) : null}
        <p className="mt-3 text-sm text-gray-800">{customerCase.description}</p>
        {customerCase.url ? (
          <p className="mt-2 text-sm text-blue-600 break-words">
            <a href={customerCase.url} target="_blank" rel="noreferrer">
              {customerCase.url}
            </a>
          </p>
        ) : null}
        {customerCase.imageUrl ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={customerCase.imageUrl}
              alt={`Visuel pour ${customerCase.title}`}
              className="h-64 w-full object-cover"
            />
          </div>
        ) : null}

        {results.length ? (
          <div className="mt-6 space-y-2 rounded-xl bg-[#f8f9ff] p-4 text-sm text-gray-900">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3b5bff]">
              Résultats
            </p>
            <ul className="space-y-1.5">
              {results.map((res) => (
                <li key={res.id} className="flex gap-2">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#3b5bff] text-[9px] font-bold text-white">
                    ✓
                  </span>
                  <span>{res.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {features.length ? (
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#1b2653]">
            {features.map((f) => (
              <span
                key={f.id}
                className="rounded-full bg-[#f0f4ff] px-3 py-1 shadow-[0_8px_18px_-16px_rgba(0,0,0,0.4)]"
              >
                {f.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
