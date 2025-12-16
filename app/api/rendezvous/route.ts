import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  rendezvousSchema,
  toScheduledDate,
} from "@/lib/validations/rendezvous";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = rendezvousSchema.parse(body);

    const scheduledAt = toScheduledDate(data.date, data.time);

    await prisma.rendezvous.create({
      data: {
        scheduledAt,
        reason: data.reason,
        details: data.content,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Données invalides", issues: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Rendezvous API error", error);
    return NextResponse.json(
      { message: "Erreur serveur, merci de réessayer plus tard" },
      { status: 500 },
    );
  }
}
