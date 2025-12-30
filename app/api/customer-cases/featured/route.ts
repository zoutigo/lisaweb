import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const featured =
      (await prisma.customerCase.findFirst({
        where: { isFeatured: true, isActive: true },
        orderBy: { createdAt: "desc" },
        include: {
          results: { orderBy: { order: "asc" } },
          features: { orderBy: { order: "asc" } },
        },
      })) ??
      (await prisma.customerCase.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        include: {
          results: { orderBy: { order: "asc" } },
          features: { orderBy: { order: "asc" } },
        },
      }));

    return NextResponse.json(featured ?? null);
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.error("Failed to load featured customer case", error);
    }
    return NextResponse.json(null, { status: 200 });
  }
}
