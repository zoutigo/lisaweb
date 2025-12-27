import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { offerOptionSchema } from "@/lib/validations/offer-option";

export const runtime = "nodejs";

type SessionUser = { email?: string | null; isAdmin?: boolean };

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean((session?.user as SessionUser)?.isAdmin);
  if (!session || !session.user?.email || !isAdmin) return null;
  return session;
}

type Params =
  | { id: string }
  | { id?: string }
  | Promise<{ id: string }>
  | Promise<{ id?: string }>;

export async function PUT(req: Request, { params }: { params: Params }) {
  const session = await ensureAdmin();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolved = await Promise.resolve(params);
  const id = resolved?.id;
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json();
  const parsed = offerOptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await prisma.offerOption.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const session = await ensureAdmin();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolved = await Promise.resolve(params);
  const id = resolved?.id;
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await prisma.offerOption.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
