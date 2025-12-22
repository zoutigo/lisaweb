import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import {
  rendezvousSchema,
  toScheduledDate,
} from "@/lib/validations/rendezvous";

type RouteContext = { params: Promise<{ id: string }> };
type SessionUser = { id?: string; email?: string | null };
type RendezvousWithDetails = {
  id: number;
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

async function ensureOwned(userId: string, id: number) {
  const rdv = await prisma.rendezvous.findUnique({ where: { id } });
  if (!rdv || rdv.userId !== userId) return null;
  return rdv;
}

export async function GET(_req: NextRequest, context: RouteContext) {
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

  const { id } = await context.params;
  const rdvId = Number(id);
  if (!rdvId || Number.isNaN(rdvId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const rdv = await ensureOwned(userId, rdvId);
  if (!rdv) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(serialize(rdv));
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = (session.user as SessionUser).id;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const rdvId = Number(id);
  if (!rdvId || Number.isNaN(rdvId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const rdv = await ensureOwned(userId, rdvId);
  if (!rdv) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await req.json();
  const parsed = rendezvousSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 422 });
  }

  const scheduledAt = toScheduledDate(parsed.data.date, parsed.data.time);
  const updated = await prisma.rendezvous.update({
    where: { id: rdvId },
    data: {
      scheduledAt,
      reason: parsed.data.reason,
      details: parsed.data.content,
    },
  });

  return NextResponse.json(serialize(updated));
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = (session.user as SessionUser).id;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const rdvId = Number(id);
  if (!rdvId || Number.isNaN(rdvId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const rdv = await ensureOwned(userId, rdvId);
  if (!rdv) return NextResponse.json({ error: "not found" }, { status: 404 });

  await prisma.rendezvous.delete({ where: { id: rdvId } });
  return NextResponse.json({ ok: true });
}
