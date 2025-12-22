import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { partnerSchema } from "@/lib/validations/partner";

type RouteContext = { params: Promise<{ id: string }> };
type SessionUser = { email?: string | null; isAdmin?: boolean };

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const idNum = Number(id);
  if (!id || Number.isNaN(idNum))
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const user = session.user as SessionUser;
  if (!user?.isAdmin)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const partner = await prisma.partner.findUnique({
    where: { id: idNum },
  });
  if (!partner)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(partner);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const idNum = Number(id);
  if (!id || Number.isNaN(idNum))
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const user = session.user as SessionUser;
  if (!user?.isAdmin)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = partnerSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ message: "Invalid" }, { status: 422 });

  const { name, logoUrl, url } = parsed.data;
  const updated = await prisma.partner.update({
    where: { id: idNum },
    data: { name, logoUrl: logoUrl || null, url: url || null },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const idNum = Number(id);
  if (!id || Number.isNaN(idNum))
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const user = session.user as SessionUser;
  if (!user?.isAdmin)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  await prisma.partner.delete({ where: { id: idNum } });
  return NextResponse.json({ success: true });
}
