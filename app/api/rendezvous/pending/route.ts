import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, time, reason, content } = body;
    if (!date || !time || !reason || !content) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const scheduledAt = new Date(`${date}T${time}`);
    const token = uuidv4();

    const rv = await prisma.rendezvous.create({
      data: {
        scheduledAt,
        reason,
        details: content,
        status: "PENDING",
        pendingToken: token,
      },
    });

    return NextResponse.json({
      success: true,
      pendingId: rv.id,
      pendingToken: token,
    });
  } catch (e) {
    console.error("create pending error", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
