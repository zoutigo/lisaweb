import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { offerOptionSchema } from "@/lib/validations/offer-option";

export const runtime = "nodejs";

type SessionUser = { email?: string | null; isAdmin?: boolean };

export async function GET() {
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean((session?.user as SessionUser)?.isAdmin);
  if (!session || !session.user?.email || !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const options = await prisma.offerOption.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(options);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean((session?.user as SessionUser)?.isAdmin);
  if (!session || !session.user?.email || !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = offerOptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const created = await prisma.offerOption.create({ data: parsed.data });
  return NextResponse.json(created, { status: 201 });
}
