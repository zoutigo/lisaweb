import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

type QuoteMailPayload = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  projectDescription: string;
  serviceOfferTitle?: string | null;
  optionTitles?: string[];
};

async function transporterFromEnv() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendQuoteEmails(payload: QuoteMailPayload) {
  const siteInfo = await prisma.siteInfo.findFirst();
  const mailFrom =
    siteInfo?.email || process.env.MAIL_FROM || "contact@lisaweb.fr";
  const notifyTo =
    siteInfo?.email || process.env.NOTIFY_TO || process.env.MAIL_FROM;
  const siteName = siteInfo?.name || "LISAWEB";
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  const logoUrl = `${siteUrl.replace(/\/$/, "")}/logo.svg`;

  const transporter = await transporterFromEnv();
  const fullName = [payload.firstName, payload.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const offerLine = payload.serviceOfferTitle
    ? `<li><strong>Format :</strong> ${payload.serviceOfferTitle}</li>`
    : "";
  const optionsLine =
    payload.optionTitles && payload.optionTitles.length
      ? `<li><strong>Options :</strong> ${payload.optionTitles.join(", ")}</li>`
      : "";

  const header = `
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin-bottom:16px;">
      <tr>
        <td style="display:flex;align-items:center;gap:12px;">
          <img src="${logoUrl}" alt="${siteName}" width="48" height="48" style="display:block;object-fit:contain;border-radius:10px;" />
          <div style="font-family:'Poppins','Raleway',system-ui,sans-serif;">
            <div style="font-size:14px;font-weight:700;letter-spacing:0.12em;color:#1b2653;text-transform:uppercase;">${siteName}</div>
            <div style="font-size:13px;color:#4b5563;">Demande de devis</div>
          </div>
        </td>
      </tr>
    </table>
  `;

  const baseBody = `
    ${header}
    <div style="padding:12px 0;font-family:'Poppins','Raleway',system-ui,sans-serif;color:#111827;font-size:15px;">
      <p>Bonjour ${fullName || ""},</p>
      <p>Nous avons bien reçu votre demande de devis.</p>
      <ul style="list-style:none;padding:0;margin:12px 0;">
        ${offerLine}
        ${optionsLine}
      </ul>
      <div style="margin-top:12px;padding:12px;border-radius:10px;background:#eef2ff;color:#1f2937;">${payload.projectDescription}</div>
    </div>
  `;

  await transporter.sendMail({
    from: mailFrom,
    to: payload.email,
    subject: "Votre demande de devis a été reçue",
    html: baseBody,
    text: `Demande de devis reçue. Projet: ${payload.projectDescription}`,
  });

  if (notifyTo) {
    await transporter.sendMail({
      from: mailFrom,
      to: notifyTo,
      subject: "Nouveau devis soumis",
      text: `Nouveau devis par ${fullName || payload.email}. Projet: ${payload.projectDescription}`,
    });
  }
}
