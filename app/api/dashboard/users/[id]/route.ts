import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { userUpdateSchema } from "@/lib/validations/user";

type RouteContext = { params: Promise<{ id: string }> };
type SessionUser = { email?: string | null; isAdmin?: boolean };

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const userSession = session.user as SessionUser;
  if (!userSession?.isAdmin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const userSession = session.user as SessionUser;
  if (!userSession?.isAdmin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json();
  const parse = userUpdateSchema.safeParse(body);
  if (!parse.success)
    return NextResponse.json({ error: "invalid" }, { status: 422 });

  const { name, firstName, lastName, phone, isAdmin } = parse.data;
  const updated = await prisma.user.update({
    where: { id },
    data: { name, firstName, lastName, phone, isAdmin },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const userSession = session.user as SessionUser;
  if (!userSession?.isAdmin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
