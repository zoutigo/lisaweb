export const runtime = "nodejs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileRdvClient from "./profile-rdv-client";
import type { Session } from "next-auth";

export const metadata = {
  title: "Mes rendez-vous",
};

export default async function ProfileRendezvousPage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session || !session.user?.email) redirect("/");
  const userId = (session.user as { id?: string }).id;
  if (!userId) redirect("/");

  type RdvRecord = {
    id: number;
    scheduledAt: Date | string;
    reason: string;
    details: string;
    status: string;
  };
  const rdvs = await (
    prisma as unknown as { rendezvous: typeof prisma.rendezvous }
  ).rendezvous.findMany({
    where: { userId },
    orderBy: { scheduledAt: "desc" },
  });

  const initial = (rdvs as RdvRecord[]).map((rdv) => {
    const dateObj = new Date(rdv.scheduledAt);
    return {
      id: rdv.id,
      date: dateObj.toISOString().slice(0, 10),
      time: dateObj.toISOString().slice(11, 16),
      reason: rdv.reason,
      content: rdv.details,
      status: rdv.status,
    };
  });

  return <ProfileRdvClient initialRendezvous={initial} />;
}
