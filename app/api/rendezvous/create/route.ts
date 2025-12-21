import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type SessionUser = { email?: string | null };
type FormPayload = {
  formData?: {
    date: string;
    time: string;
    reason: string;
    content: string;
  };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FormPayload;
    const form = body.formData;
    if (!form)
      return NextResponse.json(
        { message: "Missing formData" },
        { status: 400 },
      );

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userSession = session.user as SessionUser;

    const scheduledAt = new Date(`${form.date}T${form.time}`);

    // create or find user by email
    const user = await prisma.user.findUnique({
      where: { email: userSession.email ?? undefined },
    });

    const created = await prisma.rendezvous.create({
      data: {
        scheduledAt,
        reason: form.reason,
        details: form.content,
        userId: user ? user.id : undefined,
      },
    });

    // trigger send endpoint
    try {
      await fetch(
        `${process.env.SITE_URL || "http://localhost:3000"}/api/rendezvous/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rendezvousId: created.id,
            userEmail: userSession.email,
          }),
        },
      );
    } catch (e) {
      console.error("call send failed", e);
    }

    return NextResponse.json({ success: true, id: created.id });
  } catch (e) {
    console.error("create endpoint error", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
