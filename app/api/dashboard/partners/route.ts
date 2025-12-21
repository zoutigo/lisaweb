import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { partnerSchema } from "@/lib/validations/partner";

type SessionUser = { email?: string | null; isAdmin?: boolean };

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const user = session.user as SessionUser;
  if (!user?.isAdmin)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(partners);
}

export async function POST(request: Request) {
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
  const created = await prisma.partner.create({
    data: {
      name,
      logoUrl: logoUrl || null,
      url: url || null,
    },
  });
  return NextResponse.json(created);
}
