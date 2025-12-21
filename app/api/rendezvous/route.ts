import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import {
  rendezvousSchema,
  toScheduledDate,
} from "@/lib/validations/rendezvous";

function escapeHtml(str: string) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\r?\n/g, "<br/>");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = rendezvousSchema.parse(body);

    const scheduledAt = toScheduledDate(data.date, data.time);

    await prisma.rendezvous.create({
      data: {
        scheduledAt,
        reason: data.reason,
        details: data.content,
      },
    });

    // Envoi d'un e-mail de notification au site
    try {
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT;
      const smtpSecure = process.env.SMTP_SECURE;
      const smtpUserSet = Boolean(process.env.SMTP_USER);

      console.log("SMTP config:", {
        host: smtpHost || "(undefined)",
        port: smtpPort || "(undefined)",
        secure: smtpSecure || "(undefined)",
        user: smtpUserSet ? "(set)" : "(missing)",
      });

      if (!smtpHost) {
        console.warn(
          "SMTP_HOST non défini — envoi du mail ignoré (vérifiez .env, .env.local et redémarrage du serveur).",
        );
      } else {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: Number(smtpPort) || 587,
          secure: smtpSecure === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const mailFrom = process.env.MAIL_FROM || "contact@lisaweb.fr";
        const notifyTo = process.env.NOTIFY_TO || mailFrom;

        const subject = `Nouvelle demande de rendez-vous - ${data.reason}`;
        const text = `Nouvelle demande de rendez-vous\n\nDate: ${data.date}\nHeure: ${data.time}\nRaison: ${data.reason}\n\nDétails:\n${data.content}`;

        const siteUrl = process.env.SITE_URL || "https://lisaweb.fr";
        const logoUrl = `${siteUrl.replace(/\/$/, "")}/logo.svg`;
        const siteName = process.env.SITE_NAME || "LISAWEB";
        const contactEmail = process.env.CONTACT_EMAIL || mailFrom;
        const contactPhone = process.env.CONTACT_PHONE || "+33 6 00 00 00 00";

        const html = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f7f9fc;color:#111827;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td align="center" style="padding:32px 16px;">
                  <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                    <!-- Header -->
                    <tr>
                      <td style="padding:20px 24px;background:linear-gradient(180deg,#ffffff,#f8fafc);">
                        <div style="display:flex;align-items:center;gap:12px;">
                          <img src="${logoUrl}" alt="${siteName}" width="48" height="48" style="display:block;object-fit:contain;border-radius:6px;" />
                          <div>
                            <div style="font-weight:700;letter-spacing:0.12em;color:#1b2653;font-size:14px;text-transform:uppercase;">${siteName}</div>
                            <div style="color:#4b5563;font-size:13px;">Développeur web & mobile</div>
                          </div>
                        </div>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:24px;">
                        <h1 style="margin:0 0 12px 0;font-size:18px;color:#1b2653;font-weight:600;">Nouvelle demande de rendez-vous</h1>
                        <p style="margin:0 0 16px 0;color:#374151;line-height:1.45">Vous avez reçu une nouvelle demande via le formulaire de contact.</p>

                        <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;margin-top:8px;border-collapse:collapse;">
                          <tr>
                            <td style="padding:8px 0;color:#6b7280;width:120px;font-weight:600;">Date</td>
                            <td style="padding:8px 0;color:#374151;">${data.date}</td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;color:#6b7280;font-weight:600;">Heure</td>
                            <td style="padding:8px 0;color:#374151;">${data.time}</td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;color:#6b7280;font-weight:600;">Raison</td>
                            <td style="padding:8px 0;color:#374151;">${data.reason}</td>
                          </tr>
                        </table>

                        <div style="margin-top:16px;padding:16px;border-radius:8px;background:#f1f5ff;color:#374151;">${escapeHtml(
                          data.content,
                        )}</div>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding:20px 24px;background:#ffffff;border-top:1px solid #eef2ff;">
                        <div style="display:flex;align-items:flex-start;gap:12px;">
                          <img src="${logoUrl}" alt="${siteName}" width="40" height="40" style="display:block;object-fit:contain;border-radius:6px;" />
                          <div style="font-size:13px;color:#374151;">
                            <div style="font-weight:700;color:#1b2653;">${siteName}</div>
                            <div style="margin-top:6px;color:#6b7280;max-width:360px;">LISAWEB crée et refond des sites vitrines modernes pour les écoles, associations, artisans et TPE de Pont-de-Chéruy, Charvieu, Tignieu et Lyon Est.</div>
                            <div style="margin-top:8px;color:#1b2653;">
                              <div>Email : ${contactEmail}</div>
                              <div>Tél : ${contactPhone}</div>
                            </div>
                          </div>
                        </div>

                        <div style="margin-top:16px;border-top:1px solid #f3f4f6;padding-top:12px;font-size:12px;color:#9ca3af;">
                          © ${new Date().getFullYear()} Valery Mbele. Tous droits réservés.
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
        `;

        await transporter.sendMail({
          from: mailFrom,
          to: notifyTo,
          subject,
          text,
          html,
        });
      }
    } catch (mailError) {
      console.error("Erreur envoi mail rendezvous:", mailError);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Données invalides", issues: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Rendezvous API error", error);
    return NextResponse.json(
      { message: "Erreur serveur, merci de réessayer plus tard" },
      { status: 500 },
    );
  }
}
