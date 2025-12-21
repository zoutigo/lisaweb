import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type SessionUser = { email?: string | null; isAdmin?: boolean };

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = session.user as SessionUser;
  if (!user?.isAdmin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      isAdmin: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}
