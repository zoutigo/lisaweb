import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Body = {
  idToken?: string;
  formData?: {
    date: string;
    time: string;
    reason: string;
    content: string;
  };
};

async function verifyIdToken(idToken: string) {
  // Use Google's tokeninfo endpoint to validate the id_token.
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
  );
  if (!res.ok) return null;
  const payload = await res.json();
  return payload; // contains email, email_verified, name, picture, aud, iss, sub
}

export async function POST(request: Request) {
  try {
    const body: Body = await request.json();

    if (!body.formData) {
      return NextResponse.json(
        { message: "Missing formData" },
        { status: 400 },
      );
    }

    let userEmail: string | undefined;
    let userName: string | null = null;
    let userImage: string | null = null;

    if (body.idToken) {
      const tokenInfo = await verifyIdToken(body.idToken);
      if (!tokenInfo || !tokenInfo.email) {
        return NextResponse.json(
          { message: "Invalid id token" },
          { status: 401 },
        );
      }

      // Optional: verify audience matches your GOOGLE_CLIENT_ID
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (clientId && tokenInfo.aud !== clientId) {
        console.warn("Google id_token aud mismatch", {
          aud: tokenInfo.aud,
          clientId,
        });
      }

      userEmail = tokenInfo.email;
      userName = tokenInfo.name || null;
      userImage = tokenInfo.picture || null;

      // upsert user in DB
      await prisma.user.upsert({
        where: { email: userEmail },
        update: {
          name: userName,
          image: userImage,
        },
        create: {
          email: userEmail,
          name: userName,
          image: userImage,
        },
      });
    }

    // create rendezvous linked to user if available
    const scheduledAt = new Date(
      `${body.formData!.date}T${body.formData!.time}`,
    );

    let userRecord = null;
    if (userEmail) {
      userRecord = await prisma.user.findUnique({
        where: { email: userEmail },
      });
    }

    const created = await prisma.rendezvous.create({
      data: {
        scheduledAt,
        reason: body.formData.reason,
        details: body.formData.content,
        userId: userRecord ? userRecord.id : undefined,
      },
    });

    // Send email via existing mechanism: call internal API route (/api/rendezvous/send) or reuse transporter logic.
    // For simplicity, call internal API endpoint that exists in the same app: /api/rendezvous/send
    // We'll POST to /api/rendezvous/send with payload { rendezvousId, userEmail }

    try {
      await fetch(
        `${process.env.SITE_URL || "http://localhost:3000"}/api/rendezvous/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rendezvousId: created.id, userEmail }),
        },
      );
    } catch (e) {
      console.error("Error calling send endpoint", e);
    }

    return NextResponse.json({ success: true, id: created.id });
  } catch (e) {
    console.error("confirm route error", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
