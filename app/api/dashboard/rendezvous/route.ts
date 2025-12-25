import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type SessionUser = { email?: string | null; isAdmin?: boolean };

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as SessionUser;
  if (!user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rendezvous = await prisma.rendezvous.findMany({
    orderBy: { scheduledAt: "desc" },
    include: {
      user: {
        select: {
          email: true,
          name: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const payload = rendezvous.map((rdv) => {
    const date = rdv.scheduledAt.toISOString().slice(0, 10);
    const time = rdv.scheduledAt.toISOString().slice(11, 16);
    const userName =
      rdv.user?.name ||
      `${rdv.user?.firstName ?? ""} ${rdv.user?.lastName ?? ""}`.trim() ||
      "Utilisateur";
    return {
      id: rdv.id,
      date,
      time,
      reason: rdv.reason,
      content: rdv.details,
      status: rdv.status,
      userName,
      userEmail: rdv.user?.email ?? null,
      scheduledAt: rdv.scheduledAt.toISOString(),
    };
  });

  return NextResponse.json(payload);
}
