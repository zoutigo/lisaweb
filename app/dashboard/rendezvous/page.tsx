export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RendezvousClient } from "./rendezvous-client";

type SessionUser = { isAdmin?: boolean; email?: string | null };

export const metadata = {
  title: "Rendez-vous | Dashboard",
};

export default async function RendezvousDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/");
  const isAdmin = (session.user as SessionUser).isAdmin ?? false;
  if (!isAdmin) redirect("/");

  const rendezvous = await prisma.rendezvous.findMany({
    orderBy: { scheduledAt: "desc" },
    include: {
      user: {
        select: { email: true, name: true, firstName: true, lastName: true },
      },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Administration
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-600">
            Liste des demandes de rendez-vous en attente ou confirmées.
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="secondary" className="text-xs sm:text-sm">
            ← Retour
          </Button>
        </Link>
      </div>

      <RendezvousClient
        rendezvous={rendezvous.map((rdv) => ({
          id: rdv.id,
          date: rdv.scheduledAt.toISOString().slice(0, 10),
          time: rdv.scheduledAt.toISOString().slice(11, 16),
          reason: rdv.reason,
          content: rdv.details,
          status: rdv.status as "PENDING" | "CONFIRMED",
          userName:
            rdv.user?.name ||
            `${rdv.user?.firstName ?? ""} ${rdv.user?.lastName ?? ""}`.trim() ||
            "Utilisateur",
          userEmail: rdv.user?.email ?? null,
        }))}
      />
    </div>
  );
}
