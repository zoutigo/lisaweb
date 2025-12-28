import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

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

export async function DELETE(_req: Request, { params }: QuoteParams) {
  const session = await guard();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  await prisma.quoteRequest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
