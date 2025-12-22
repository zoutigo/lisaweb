import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const site = await prisma.siteInfo.findFirst({
    select: {
      name: true,
      email: true,
      address: true,
      city: true,
      postalCode: true,
      country: true,
      phone: true,
    },
  });
  return NextResponse.json(site || null);
}
