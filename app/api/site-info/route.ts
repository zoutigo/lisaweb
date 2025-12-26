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
  const fallback = {
    name: "LiSAWEB",
    email: "contact@lisaweb.fr",
    address: "89C rue du travail",
    city: "Pont de Cheruy",
    postalCode: "38230",
    country: "France",
    phone: "0650597839",
  };
  return NextResponse.json(site || fallback);
}
