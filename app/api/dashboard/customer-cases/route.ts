import { prisma } from "@/lib/prisma";
import { customerCaseSchema } from "@/lib/validations/customer-case";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean((session?.user as { isAdmin?: boolean })?.isAdmin);
  if (!session || !session.user?.email || !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cases = await prisma.customerCase.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(cases);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean((session?.user as { isAdmin?: boolean })?.isAdmin);
  if (!session || !session.user?.email || !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json();
  const parsed = customerCaseSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = {
    ...parsed.data,
    isOnLandingPage: parsed.data.isOnLandingPage ?? false,
    customer: parsed.data.customer || null,
    url: parsed.data.url || null,
    imageUrl: parsed.data.imageUrl || null,
  };

  const created = await prisma.$transaction(async (tx) => {
    if (data.isOnLandingPage) {
      await tx.customerCase.updateMany({
        data: { isOnLandingPage: false },
        where: { isOnLandingPage: true },
      });
    }
    return tx.customerCase.create({ data });
  });
  return NextResponse.json(created, { status: 201 });
}
