import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import type { QuoteStatus } from "@prisma/client";

export const runtime = "nodejs";

async function guard() {
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean((session?.user as { isAdmin?: boolean })?.isAdmin);
  if (!session || !session.user?.email || !isAdmin) return null;
  return session;
}

type QuoteParams =
  | { params: { id: string } }
  | { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: QuoteParams) {
  const session = await guard();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const payload = await req.json().catch(() => ({}));
  const projectDescription = (payload?.projectDescription as string) ?? "";
  const serviceOfferId =
    (payload?.serviceOfferId as string | undefined) || null;
  const offerOptionsInput: { id: string; quantity?: number }[] = Array.isArray(
    payload?.offerOptions,
  )
    ? payload.offerOptions
    : [];
  const status = payload?.status as QuoteStatus | undefined;

  if (!projectDescription.trim()) {
    return NextResponse.json(
      { error: "La description est requise" },
      { status: 400 },
    );
  }
  if (status && !["NEW", "SENT", "REVIEWED"].includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const updated = await prisma.quoteRequest.update({
    where: { id },
    data: {
      projectDescription,
      serviceOfferId,
      quoteOptions: {
        deleteMany: { quoteRequestId: id },
        createMany: {
          data: offerOptionsInput
            .filter((opt) => opt.id)
            .map((opt) => ({
              offerOptionId: opt.id,
              quantity: Math.max(1, opt.quantity ?? 1),
            })),
        },
      },
      status: status ?? undefined,
    },
    include: {
      quoteOptions: { include: { option: true } },
      serviceOffer: true,
    },
  });

  return NextResponse.json(updated);
}

export async function PUT(req: Request, { params }: QuoteParams) {
  const session = await guard();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const payload = await req.json().catch(() => ({}));
  const status = payload?.status as QuoteStatus | undefined;
  if (!status || !["NEW", "SENT", "REVIEWED"].includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const updated = await prisma.quoteRequest.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: QuoteParams) {
  const session = await guard();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  await prisma.quoteRequest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
