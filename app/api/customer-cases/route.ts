import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const cases = await prisma.customerCase.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        results: { orderBy: { order: "asc" } },
        features: { orderBy: { order: "asc" } },
      },
    });
    return NextResponse.json(cases);
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.error("Failed to load customer cases (public)", error);
    }
    return NextResponse.json([], { status: 200 });
  }
}
