export const runtime = "nodejs";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { PartnersClient } from "./partners-client";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const placeholderLogo = "/partner-placeholder.svg";

export default async function PartnersPage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session || !session.user?.email) redirect("/");

  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;
  if (!isAdmin) redirect("/");

  type PartnerRecord = {
    id: number;
    name: string;
    logoUrl: string | null;
    url: string | null;
    createdAt: Date;
  };

  const partners = (await (
    prisma as unknown as { partner: typeof prisma.partner }
  ).partner.findMany({
    select: {
      id: true,
      name: true,
      logoUrl: true,
      url: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })) as PartnerRecord[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Administration
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Partenaires</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="secondary" className="text-xs sm:text-sm">
              ← Retour
            </Button>
          </Link>
          <div className="text-sm text-gray-500">
            {partners.length} partenaire{partners.length > 1 ? "s" : ""}
          </div>
          <ActionIconButton
            as="link"
            href="/dashboard/partners/new"
            action="create"
            label="Créer un partenaire"
            tone="primary"
          />
        </div>
      </div>
      <PartnersClient
        partners={partners.map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
        }))}
        placeholderLogo={placeholderLogo}
      />
    </div>
  );
}
