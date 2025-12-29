import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { quoteRequestSchema } from "@/lib/validations/quote";
import { sendQuoteEmails } from "@/lib/quote-mail";
import { toScheduledDate } from "@/lib/validations/rendezvous";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const json = await req.json().catch(() => null);
  const parsed = quoteRequestSchema.safeParse(json);
  if (!parsed.success) {
    const firstError =
      parsed.error.errors[0]?.message ??
      "Données invalides pour la demande de devis.";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const data = parsed.data;
  const sessionEmail = session?.user?.email;
  const sessionUserId = (session?.user as { id?: string })?.id;
  const userFromEmail = sessionEmail
    ? await prisma.user.findUnique({ where: { email: sessionEmail } })
    : null;
  const userId = userFromEmail?.id ?? sessionUserId ?? null;
  const email = data.email || sessionEmail;

  if (!email) {
    return NextResponse.json(
      { error: "Email requis pour la demande de devis." },
      { status: 400 },
    );
  }

  let rendezvousId: string | null = null;
  if (
    data.rendezvous?.date &&
    data.rendezvous?.time &&
    data.rendezvous?.reason
  ) {
    const scheduledAt = toScheduledDate(
      data.rendezvous.date,
      data.rendezvous.time,
    );
    const rdv = await prisma.rendezvous.create({
      data: {
        scheduledAt,
        reason: data.rendezvous.reason,
        details: data.rendezvous.content ?? "",
        userId: userId ?? null,
        status: "PENDING",
      },
    });
    rendezvousId = rdv.id;
  }

  const created = await prisma.quoteRequest.create({
    data: {
      userId: userId ?? null,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      email,
      phone: data.phone || null,
      projectDescription: data.projectDescription,
      desiredDeliveryDate: data.desiredDeliveryDate
        ? new Date(data.desiredDeliveryDate)
        : null,
      serviceOfferId: data.serviceOfferId || null,
      rendezvousId,
      quoteOptions: {
        createMany: {
          data: (data.offerOptionIds ?? []).map((id) => ({
            offerOptionId: id,
            quantity: 1,
          })),
        },
      },
    },
    include: {
      serviceOffer: true,
      quoteOptions: { include: { option: true } },
    },
  });

  await sendQuoteEmails({
    email,
    firstName: data.firstName,
    lastName: data.lastName,
    projectDescription: data.projectDescription,
    serviceOfferTitle: created.serviceOffer?.title,
    optionTitles: created.quoteOptions?.map((o) => o.option?.title ?? "") ?? [],
  });

  return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
}
