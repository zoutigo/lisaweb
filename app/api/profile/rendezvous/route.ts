import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import {
  rendezvousSchema,
  toScheduledDate,
} from "@/lib/validations/rendezvous";

type SessionUser = { id?: string; email?: string | null };
type RendezvousWithDetails = {
  id: string;
  scheduledAt: Date | string;
  details: string;
  status: string;
};

function serialize(rdv: RendezvousWithDetails) {
  const dateObj = new Date(rdv.scheduledAt);
  const date = dateObj.toISOString().slice(0, 10);
  const time = dateObj.toISOString().slice(11, 16);
  return { ...rdv, content: rdv.details, date, time };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = (session.user as SessionUser).id;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const list = await prisma.rendezvous.findMany({
    where: { userId },
    orderBy: { scheduledAt: "desc" },
  });
  return NextResponse.json(list.map(serialize));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = (session.user as SessionUser).id;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  });
  if (!user?.phone?.trim()) {
    return NextResponse.json(
      {
        error: "missing_phone",
        message:
          "Merci d'ajouter un numéro de téléphone à votre profil avant de programmer un rendez-vous.",
      },
      { status: 422 },
    );
  }

  const body = await req.json();
  const parsed = rendezvousSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 422 });
  }

  const scheduledAt = toScheduledDate(parsed.data.date, parsed.data.time);
  const created = await prisma.rendezvous.create({
    data: {
      scheduledAt,
      reason: parsed.data.reason,
      details: parsed.data.content,
      userId,
      status: "PENDING",
    },
  });

  return NextResponse.json(serialize(created), { status: 201 });
}
