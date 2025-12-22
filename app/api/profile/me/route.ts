import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { userSelfUpdateSchema } from "@/lib/validations/user";

type SessionUser = {
  id?: string;
  email?: string | null;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = (session.user as SessionUser).id;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      isAdmin: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = (session.user as SessionUser).id;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = userSelfUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 422 });
  }

  const { name, firstName, lastName, phone } = parsed.data;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { name, firstName, lastName, phone },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      isAdmin: true,
    },
  });

  return NextResponse.json(updated);
}
