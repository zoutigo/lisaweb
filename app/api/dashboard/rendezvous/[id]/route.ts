import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import {
  rendezvousBaseSchema,
  toScheduledDate,
} from "@/lib/validations/rendezvous";
import { sendRendezvousConfirmationEmail } from "@/lib/rendezvous-mail";
import { z } from "zod";

export const runtime = "nodejs";

type SessionUser = { email?: string | null; isAdmin?: boolean };

const adminUpdateSchema = z
  .object({
    date: rendezvousBaseSchema.shape.date.optional(),
    time: rendezvousBaseSchema.shape.time.optional(),
    reason: rendezvousBaseSchema.shape.reason.optional(),
    content: rendezvousBaseSchema.shape.content.optional(),
    status: z.enum(["PENDING", "CONFIRMED"]).optional(),
  })
  .superRefine((val, ctx) => {
    const hasDate = !!val.date;
    const hasTime = !!val.time;
    if (hasDate !== hasTime) {
      ctx.addIssue({
        code: "custom",
        path: ["date"],
        message: "Date et heure doivent être fournies ensemble",
      });
    }
    if (hasDate && hasTime) {
      try {
        toScheduledDate(val.date ?? "", val.time ?? "");
      } catch {
        ctx.addIssue({
          code: "custom",
          path: ["date"],
          message: "Date ou heure invalide",
        });
      }
    }
  });

function serialize(rdv: {
  id: string;
  scheduledAt: Date | string;
  details: string;
  status: string;
  reason: string;
}) {
  const dateObj = new Date(rdv.scheduledAt);
  const date = dateObj.toISOString().slice(0, 10);
  const time = dateObj.toISOString().slice(11, 16);
  return {
    id: rdv.id,
    date,
    time,
    reason: rdv.reason,
    content: rdv.details,
    status: rdv.status,
  };
}

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return { status: 401 as const };
  }
  const user = session.user as SessionUser;
  if (!user.isAdmin) {
    return { status: 403 as const };
  }
  return { status: 200 as const };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await ensureAdmin();
  if (auth.status !== 200) {
    return NextResponse.json(
      { error: auth.status === 401 ? "Unauthorized" : "Forbidden" },
      { status: auth.status },
    );
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const existing = await prisma.rendezvous.findUnique({
    where: { id },
    include: {
      user: {
        select: { email: true, name: true, firstName: true, lastName: true },
      },
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = adminUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  }

  const data = parsed.data;
  let scheduledAt = existing.scheduledAt;
  if (data.date || data.time) {
    scheduledAt = toScheduledDate(data.date ?? "", data.time ?? "");
  }

  const updated = await prisma.rendezvous.update({
    where: { id },
    data: {
      scheduledAt,
      reason: data.reason ?? existing.reason,
      details: data.content ?? existing.details,
      status:
        (data.status as "PENDING" | "CONFIRMED" | undefined) ?? existing.status,
    },
  });

  if (existing.status !== "CONFIRMED" && updated.status === "CONFIRMED") {
    await sendRendezvousConfirmationEmail({
      userEmail: existing.user?.email,
      reason: updated.reason,
      scheduledAt: updated.scheduledAt,
      details: updated.details,
    }).catch(() => {});
  }

  return NextResponse.json(serialize(updated));
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await ensureAdmin();
  if (auth.status !== 200) {
    return NextResponse.json(
      { error: auth.status === 401 ? "Unauthorized" : "Forbidden" },
      { status: auth.status },
    );
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await prisma.rendezvous.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
