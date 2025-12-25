import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const featured =
    (await prisma.customerCase.findFirst({
      where: { isOnLandingPage: true },
      orderBy: { createdAt: "desc" },
    })) ??
    (await prisma.customerCase.findFirst({
      orderBy: { createdAt: "desc" },
    }));

  return NextResponse.json(featured ?? null);
}
