import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  rendezvousSchema,
  toScheduledDate,
} from "@/lib/validations/rendezvous";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const sessionUser = session.user as { email?: string | null; id?: string };

    const body = await request.json();
    const parsed = rendezvousSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid data" }, { status: 422 });
    }

    const userId = sessionUser.id;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
      },
    });
    if (!user || !user.phone) {
      return NextResponse.json({ message: "Phone missing" }, { status: 422 });
    }

    const scheduledAt = toScheduledDate(parsed.data.date, parsed.data.time);
    await prisma.rendezvous.create({
      data: {
        scheduledAt,
        reason: parsed.data.reason,
        details: parsed.data.content,
        status: "PENDING",
        userId,
      },
    });

    const siteInfo = await prisma.siteInfo.findFirst();
    const mailFrom =
      siteInfo?.email || process.env.MAIL_FROM || "contact@lisaweb.fr";
    const notifyTo =
      siteInfo?.email || process.env.NOTIFY_TO || process.env.MAIL_FROM;
    const userEmail = user.email || sessionUser.email || mailFrom;
    const sitePhone = siteInfo?.phone || "";
    const siteName = siteInfo?.name || "LISAWEB";
    const siteUrl = process.env.SITE_URL || "http://localhost:3000";
    const logoUrl = `${siteUrl.replace(/\/$/, "")}/logo.svg`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const header = `
      <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin-bottom:16px;">
        <tr>
          <td style="display:flex;align-items:center;gap:12px;">
            <img src="${logoUrl}" alt="${siteName}" width="48" height="48" style="display:block;object-fit:contain;border-radius:10px;" />
            <div style="font-family:'Poppins','Raleway',system-ui,sans-serif;">
              <div style="font-size:14px;font-weight:700;letter-spacing:0.12em;color:#1b2653;text-transform:uppercase;">${siteName}</div>
              <div style="font-size:13px;color:#4b5563;">Développeur web & mobile</div>
            </div>
          </td>
        </tr>
      </table>
    `;

    const footer = `
      <div style="margin-top:16px;padding-top:12px;border-top:1px solid #eef2ff;color:#374151;font-size:12px;">
        <div style="font-weight:700;color:#1b2653;">${siteName}</div>
        ${siteInfo?.email ? `<div style="margin-top:4px;">Email : ${siteInfo.email}</div>` : ""}
        ${sitePhone ? `<div>Tél : ${sitePhone}</div>` : ""}
      </div>
    `;

    const baseHtml = (intro: string) => `
      <div style="font-family:'Poppins','Raleway',system-ui,sans-serif;background:#f7f9fc;padding:20px;color:#111827;">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:18px;padding:24px;box-shadow:0 16px 60px -24px rgba(27,38,83,0.25);">
          ${header}
          <div style="font-size:16px;line-height:1.6;color:#1b2653;">${intro}</div>
          <div style="margin-top:12px;padding:14px;border-radius:12px;background:#f1f5ff;color:#1b2653;">
            <div><strong>Date :</strong> ${parsed.data.date} à ${parsed.data.time}</div>
            <div style="margin-top:6px;"><strong>Raison :</strong> ${parsed.data.reason}</div>
            <div style="margin-top:10px;color:#374151;">${parsed.data.content}</div>
          </div>
          ${footer}
        </div>
      </div>
    `;

    // Mail to user (accusé de réception)
    const userSubject = "Demande de rendez-vous reçue";
    await transporter.sendMail({
      from: mailFrom,
      to: userEmail,
      subject: userSubject,
      text: `Votre demande de rendez-vous a été enregistrée. Vous recevrez bientôt la confirmation.\nDate: ${parsed.data.date} ${parsed.data.time}\nRaison: ${parsed.data.reason}\n\n${parsed.data.content}`,
      html: baseHtml(
        "Votre demande de rendez-vous a bien été enregistrée. Vous recevrez très bientôt une confirmation par email.",
      ),
    });

    // Mail to admin/site
    if (notifyTo) {
      const adminSubject = "Nouvelle demande de rendez-vous en attente";
      await transporter.sendMail({
        from: mailFrom,
        to: notifyTo,
        subject: adminSubject,
        text: `Une demande de rendez-vous est en attente d'approbation.\nUtilisateur: ${userEmail}\nDate: ${parsed.data.date} ${parsed.data.time}\nRaison: ${parsed.data.reason}\n\n${parsed.data.content}`,
        html: baseHtml(
          `Une nouvelle demande de rendez-vous est en attente d'approbation pour ${userEmail}.`,
        ),
      });
    }

    return NextResponse.json({
      success: true,
      email: userEmail,
    });
  } catch (e) {
    console.error("rendezvous request error", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
