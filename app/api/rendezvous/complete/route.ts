import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type SessionUser = { email?: string | null };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pendingToken } = body as { pendingToken?: string };
    if (!pendingToken)
      return NextResponse.json(
        { message: "Missing pendingToken" },
        { status: 400 },
      );

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const userSession = session.user as SessionUser;

    const rv = await prisma.rendezvous.findUnique({ where: { pendingToken } });
    if (!rv)
      return NextResponse.json(
        { message: "Pending rendezvous not found" },
        { status: 404 },
      );

    // find user
    const user = await prisma.user.findUnique({
      where: { email: userSession.email ?? undefined },
    });

    const updated = await prisma.rendezvous.update({
      where: { id: rv.id },
      data: {
        status: "CONFIRMED",
        pendingToken: null,
        userId: user ? user.id : undefined,
      },
    });

    // trigger send endpoint to email user + admin
    try {
      await fetch(
        `${process.env.SITE_URL || "http://localhost:3000"}/api/rendezvous/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rendezvousId: updated.id,
            userEmail: session.user.email,
          }),
        },
      );
    } catch (e) {
      console.error("call send failed", e);
    }

    return NextResponse.json({ success: true, id: updated.id });
  } catch (e) {
    console.error("complete endpoint error", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
