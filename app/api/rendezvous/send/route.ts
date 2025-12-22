import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { rendezvousId, userEmail } = await request.json();
    if (!rendezvousId)
      return NextResponse.json(
        { message: "Missing rendezvousId" },
        { status: 400 },
      );

    const rv = await prisma.rendezvous.findUnique({
      where: { id: Number(rendezvousId) },
    });
    if (!rv)
      return NextResponse.json(
        { message: "Rendezvous not found" },
        { status: 404 },
      );

    // prepare transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailFrom = process.env.MAIL_FROM || "contact@lisaweb.fr";
    const notifyTo = process.env.NOTIFY_TO || mailFrom;

    const subject = `Confirmation rendez-vous - ${rv.reason}`;
    const text = `Votre rendez-vous a été enregistré.\n\nDate: ${rv.scheduledAt.toISOString()}\nRaison: ${rv.reason}\n\nDétails:\n${rv.details}`;

    // Build simple HTML similar to previous template
    const html = `<p>Votre rendez-vous a été enregistré.</p><p><strong>Date:</strong> ${rv.scheduledAt.toISOString()}</p><p><strong>Raison:</strong> ${rv.reason}</p><div style="margin-top:12px;padding:12px;border-radius:8px;background:#f1f5ff;color:#374151;">${rv.details}</div>`;

    // recipients: user (if present) and notifyTo
    const recipients = userEmail ? `${userEmail},${notifyTo}` : notifyTo;

    await transporter.sendMail({
      from: mailFrom,
      to: recipients,
      subject,
      text,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("send endpoint error", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
