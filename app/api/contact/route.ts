import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations/contact";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const siteInfo = await prisma.siteInfo.findFirst();
  const siteEmail = siteInfo?.email || process.env.MAIL_FROM;
  const siteName = siteInfo?.name || "LISAWEB";
  const sitePhone = siteInfo?.phone || "";
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  const logoUrl = `${siteUrl.replace(/\/$/, "")}/logo.svg`;

  const { email, phone, reason, message } = parsed.data;

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
            <div style="font-size:13px;color:#4b5563;">Demande de contact</div>
          </div>
        </td>
      </tr>
    </table>
  `;

  const userHtml = `
    ${header}
    <div style="padding:12px 0;font-family:'Poppins','Raleway',system-ui,sans-serif;color:#111827;font-size:15px;">
      <p>Bonjour,</p>
      <p>Nous avons bien reçu votre demande :</p>
      <ul style="list-style:none;padding:0;margin:12px 0;">
        <li><strong>Email :</strong> ${email}</li>
        <li><strong>Téléphone :</strong> ${phone}</li>
        <li><strong>Objet :</strong> ${reason}</li>
      </ul>
      <div style="margin-top:12px;padding:12px;border-radius:10px;background:#eef2ff;color:#1f2937;">${message}</div>
      <p style="margin-top:12px;">Nous revenons vers vous dans les plus brefs délais.</p>
    </div>
  `;

  const adminHtml = `
    ${header}
    <div style="padding:12px 0;font-family:'Poppins','Raleway',system-ui,sans-serif;color:#111827;font-size:15px;">
      <p>Nouvelle demande de contact reçue.</p>
      <ul style="list-style:none;padding:0;margin:12px 0;">
        <li><strong>Email :</strong> ${email}</li>
        <li><strong>Téléphone :</strong> ${phone}</li>
        <li><strong>Objet :</strong> ${reason}</li>
      </ul>
      <div style="margin-top:12px;padding:12px;border-radius:10px;background:#eef2ff;color:#1f2937;">${message}</div>
      ${sitePhone ? `<p style="margin-top:12px;">Téléphone du site : ${sitePhone}</p>` : ""}
    </div>
  `;

  try {
    await transporter.sendMail({
      from: siteEmail || process.env.MAIL_FROM,
      to: email,
      subject: `${siteName} - Réception de votre message`,
      html: userHtml,
    });

    if (siteEmail) {
      await transporter.sendMail({
        from: siteEmail || process.env.MAIL_FROM,
        to: siteEmail,
        subject: `${siteName} - Nouvelle demande de contact`,
        html: adminHtml,
      });
    }
  } catch (error) {
    console.error("CONTACT_EMAIL_ERROR", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi des emails" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
