export const runtime = "nodejs";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PartnerActions } from "./actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { Session } from "next-auth";

const placeholderLogo = "/partner-placeholder.svg";

export default async function PartnerViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) redirect("/dashboard/partners");

  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session || !session.user?.email) redirect("/");
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;
  if (!isAdmin) redirect("/");

  const partner = await prisma.partner.findUnique({
    where: { id },
  });
  if (!partner) redirect("/dashboard/partners");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Fiche partenaire
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{partner.name}</h1>
        </div>
        <Link href="/dashboard/partners">
          <Button variant="secondary" className="text-xs sm:text-sm">
            ← Retour
          </Button>
        </Link>
      </div>

      <Card className="mt-6 border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <Image
              src={partner.logoUrl || placeholderLogo}
              alt={partner.name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {partner.name}
              </p>
              <p className="text-sm text-gray-600">
                {partner.url ? (
                  <Link
                    href={partner.url}
                    className="text-blue-600 hover:underline"
                  >
                    {partner.url}
                  </Link>
                ) : (
                  "Site non renseigné"
                )}
              </p>
            </div>
          </div>

          <dl className="mt-6 space-y-3 text-sm text-gray-800">
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-gray-500">
                Nom
              </dt>
              <dd className="mt-1 font-medium text-gray-900">{partner.name}</dd>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-gray-500">
                Site web
              </dt>
              <dd className="mt-1 font-medium text-gray-900 break-words">
                {partner.url ? (
                  <Link
                    href={partner.url}
                    className="text-blue-600 hover:underline"
                  >
                    {partner.url}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-gray-500">
                Logo
              </dt>
              <dd className="mt-1 font-medium text-gray-900 break-words">
                <div className="flex items-center gap-3">
                  <Image
                    src={partner.logoUrl || placeholderLogo}
                    alt={partner.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <span className="text-sm text-gray-600 break-all">
                    {partner.logoUrl || "Aucun logo"}
                  </span>
                </div>
              </dd>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-gray-500">
                Créé le
              </dt>
              <dd className="mt-1 font-medium text-gray-900">
                {new Date(partner.createdAt).toLocaleDateString("fr-FR")}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 sm:px-6">
          <PartnerActions partnerId={partner.id} />
        </div>
      </Card>
    </div>
  );
}
