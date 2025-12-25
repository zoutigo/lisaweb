import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

type MailPayload = {
  userEmail: string | null | undefined;
  reason: string;
  scheduledAt: Date;
  details: string;
};

export async function sendRendezvousConfirmationEmail({
  userEmail,
  reason,
  scheduledAt,
  details,
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
    <div style="margin-top:16px;padding:12px;border-radius:10px;background:#f5f7fb;color:#4b5563;font-size:13px;font-family:'Poppins','Raleway',system-ui,sans-serif;">
      <div>${siteName}</div>
      ${sitePhone ? `<div>Tel : ${sitePhone}</div>` : ""}
      <div>Rendez-vous confirmé, à bientôt.</div>
    </div>
  `;

  const dateStr = scheduledAt.toLocaleDateString("fr-FR");
  const timeStr = scheduledAt.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const subject = `Rendez-vous confirmé - ${reason}`;
  const html = `
    ${header}
    <div style="padding:12px 0;font-family:'Poppins','Raleway',system-ui,sans-serif;color:#111827;font-size:15px;">
      <p>Bonjour,</p>
      <p>Votre rendez-vous est confirmé.</p>
      <ul style="list-style:none;padding:0;margin:12px 0;">
        <li><strong>Date :</strong> ${dateStr}</li>
        <li><strong>Heure :</strong> ${timeStr}</li>
        <li><strong>Objet :</strong> ${reason}</li>
      </ul>
      <div style="margin-top:12px;padding:12px;border-radius:10px;background:#eef2ff;color:#1f2937;">${details}</div>
    </div>
    ${footer}
  `;

  const text = `Rendez-vous confirmé\nDate: ${dateStr}\nHeure: ${timeStr}\nObjet: ${reason}\n\n${details}`;

  await transporter.sendMail({
    from: mailFrom,
    to: userEmail,
    cc: notifyTo,
    subject,
    text,
    html,
  });
}
