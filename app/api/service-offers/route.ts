import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const offers = await prisma.serviceOffer.findMany({
      orderBy: { order: "asc" },
      include: {
        features: { orderBy: { order: "asc" } },
        steps: { orderBy: { order: "asc" } },
        useCases: true,
        offerOptions: true,
      },
    });
    return NextResponse.json(offers);
  } catch (error) {
    console.error("Failed to fetch service offers", error);
    return NextResponse.json(
      { error: "Impossible de charger les offres" },
      { status: 500 },
    );
  }
}
