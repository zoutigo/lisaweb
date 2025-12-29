/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { QuoteDetailClient } from "../quote-detail-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ActionIconButton } from "@/components/ui/action-icon-button";

export const runtime = "nodejs";

type Props = { params: { id: string } };

export default async function QuoteDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean((session?.user as { isAdmin?: boolean })?.isAdmin);
  if (!session || !session.user?.email || !isAdmin) {
    redirect("/");
  }

  const resolved = await params;

  const quote = (await prisma.quoteRequest.findUnique({
    where: { id: resolved.id },
    include: {
      serviceOffer: {
        select: {
          title: true,
          priceLabel: true,
          durationDays: true,
          offerOptions: {
            select: {
              id: true,
              title: true,
              pricingType: true,
              priceCents: true,
              priceFromCents: true,
              unitLabel: true,
              unitPriceCents: true,
              durationDays: true,
            },
          },
        },
      },
      quoteOptions: {
        include: {
          option: {
            select: {
              id: true,
              title: true,
              pricingType: true,
              priceCents: true,
              priceFromCents: true,
              unitLabel: true,
              unitPriceCents: true,
              durationDays: true,
            },
          },
        },
      },
      rendezvous: true,
    },
  } as any)) as any;

  if (!quote) {
    redirect("/dashboard/quotes");
  }

  return (
    <Section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          eyebrow="Devis"
          title="Détail du devis"
          description="Consultez les informations du client et mettez à jour le statut."
        />
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ActionIconButton
            action="edit"
            label="Modifier"
            as="link"
            href={`/dashboard/quotes/${quote.id}/edit`}
            tone="primary"
          />
          <Link href="/dashboard/quotes">
            <Button variant="secondary" className="text-sm">
              ← Retour
            </Button>
          </Link>
        </div>
      </div>
      <QuoteDetailClient
        quote={{
          id: quote.id,
          firstName: quote.firstName,
          lastName: quote.lastName,
          email: quote.email,
          phone: quote.phone,
          projectDescription: quote.projectDescription,
          desiredDeliveryDate: quote.desiredDeliveryDate?.toISOString() ?? null,
          serviceOfferTitle: quote.serviceOffer?.title ?? null,
          serviceOfferDurationDays: quote.serviceOffer?.durationDays ?? 0,
          serviceOfferPriceLabel: quote.serviceOffer?.priceLabel ?? null,
          serviceOfferOptions: quote.serviceOffer?.offerOptions ?? [],
          offerOptions: (quote.quoteOptions as any[]).map((qo: any) => ({
            ...qo.option,
            quantity: qo.quantity,
          })),
          status: quote.status,
          createdAt: quote.createdAt.toISOString(),
          rendezvous: quote.rendezvous
            ? {
                id: quote.rendezvous.id,
                scheduledAt: quote.rendezvous.scheduledAt.toISOString(),
                reason: quote.rendezvous.reason,
                details: quote.rendezvous.details,
              }
            : null,
        }}
      />
    </Section>
  );
}
