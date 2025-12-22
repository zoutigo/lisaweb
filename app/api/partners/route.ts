import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const partners = await prisma.partner.findMany({
    select: { id: true, name: true, logoUrl: true, url: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(partners);
}
