import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import {
  rendezvousSchema,
  toScheduledDate,
} from "@/lib/validations/rendezvous";
import nodemailer from "nodemailer";

type SessionUser = { id?: string; email?: string | null };
type RendezvousWithDetails = {
  id: number;
  scheduledAt: Date | string;
  details: string;
  status: string;
};

function serialize(rdv: RendezvousWithDetails) {
  const dateObj = new Date(rdv.scheduledAt);
  const date = dateObj.toISOString().slice(0, 10);
  const time = dateObj.toISOString().slice(11, 16);
  return { ...rdv, content: rdv.details, date, time };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = (session.user as SessionUser).id;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const list = await prisma.rendezvous.findMany({
    where: { userId },
    orderBy: { scheduledAt: "desc" },
  });
  return NextResponse.json(list.map(serialize));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = (session.user as SessionUser).id;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  });
  if (!user?.phone?.trim()) {
    return NextResponse.json(
      {
        error: "missing_phone",
        message:
          "Merci d'ajouter un numéro de téléphone à votre profil avant de programmer un rendez-vous.",
      },
      { status: 422 },
    );
  }

  const body = await req.json();
  const parsed = rendezvousSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 422 });
  }

  const scheduledAt = toScheduledDate(parsed.data.date, parsed.data.time);
  const created = await prisma.rendezvous.create({
    data: {
      scheduledAt,
      reason: parsed.data.reason,
      details: parsed.data.content,
      userId,
    },
  });

  try {
    await sendRdvEmails({
      userEmail: session.user.email,
      reason: parsed.data.reason,
      date: parsed.data.date,
      time: parsed.data.time,
      content: parsed.data.content,
    });
  } catch (e) {
    console.error("profile rendezvous mail error", e);
  }

  return NextResponse.json(serialize(created), { status: 201 });
}

type MailPayload = {
  userEmail: string | null | undefined;
  reason: string;
  date: string;
  time: string;
  content: string;
};

async function sendRdvEmails({
  userEmail,
  reason,
  date,
  time,
  content,
}: MailPayload) {
  if (!userEmail) return;

  const siteInfo = await prisma.siteInfo.findFirst();
  const mailFrom =
    siteInfo?.email || process.env.MAIL_FROM || "contact@lisaweb.fr";
  const notifyTo =
    siteInfo?.email || process.env.NOTIFY_TO || process.env.MAIL_FROM;
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
          <div><strong>Date :</strong> ${date} à ${time}</div>
          <div style="margin-top:6px;"><strong>Raison :</strong> ${reason}</div>
          <div style="margin-top:10px;color:#374151;">${content}</div>
        </div>
        ${footer}
      </div>
    </div>
  `;

  // Mail to user
  await transporter.sendMail({
    from: mailFrom,
    to: userEmail,
    subject: `${siteName} - Votre demande de rendez-vous`,
    text: `Votre demande de rendez-vous a été enregistrée. Vous recevrez bientôt la confirmation.\nDate: ${date} ${time}\nRaison: ${reason}\n\n${content}`,
    html: baseHtml(
      "Votre demande de rendez-vous a bien été enregistrée. Vous recevrez très bientôt une confirmation par email.",
    ),
  });

  // Mail to admin/site
  if (notifyTo) {
    await transporter.sendMail({
      from: mailFrom,
      to: notifyTo,
      subject: ` Demande de rendez-vous reçue`,
      text: `Une nouvelle demande rendez-vous est en attente d'approbation.\nUtilisateur: ${userEmail}\nDate: ${date} ${time}\nRaison: ${reason}\n\n${content}`,
      html: baseHtml(
        `Une nouvelle demande de rendez-vous est en attente d'approbation pour ${userEmail}.`,
      ),
    });
  }
}
