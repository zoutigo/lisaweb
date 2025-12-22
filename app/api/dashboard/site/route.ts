import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { siteInfoSchema } from "@/lib/validations/site-info";

type SessionUser = { email?: string | null; isAdmin?: boolean };

export async function GET() {
  const site = await prisma.siteInfo.findFirst();
  return NextResponse.json(site || null);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = session.user as SessionUser;
  if (!user?.isAdmin)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = siteInfoSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ message: "Invalid" }, { status: 422 });

  const { name, email, address, city, postalCode, country, phone } =
    parsed.data;

  const existing = await prisma.siteInfo.findFirst();
  if (existing) {
    const updated = await prisma.siteInfo.update({
      where: { id: existing.id },
      data: { name, email, address, city, postalCode, country, phone },
    });
    return NextResponse.json(updated);
  }

  const created = await prisma.siteInfo.create({
    data: { name, email, address, city, postalCode, country, phone },
  });
  return NextResponse.json(created);
}
