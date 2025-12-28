import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean((session?.user as { isAdmin?: boolean })?.isAdmin);
  if (!session || !session.user?.email || !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quotes = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      serviceOffer: true,
      quoteOptions: { include: { option: true } },
    },
  });
  return NextResponse.json(quotes);
}
