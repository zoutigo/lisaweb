/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import { Button } from "@/components/ui/button";
import { QuoteEditClient } from "../../quote-edit-client";

export const runtime = "nodejs";

type Props = { params: { id: string } };

export default async function QuoteEditPage({ params }: Props) {
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

  const [availableOffers, availableOptions] = (await Promise.all([
    prisma.serviceOffer.findMany({
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        priceLabel: true,
        durationDays: true,
        offerOptions: { select: { id: true } },
      },
    } as any),
    prisma.offerOption.findMany({
      orderBy: { title: "asc" },
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
    } as any),
  ])) as any;

  if (!quote) {
    redirect("/dashboard/quotes");
  }

  return (
    <Section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          eyebrow="Devis"
          title="Modifier le devis"
          description="Ajustez le statut ou les informations associées."
        />
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ActionIconButton
            action="view"
            label="Voir"
            as="link"
            href={`/dashboard/quotes/${quote.id}`}
            tone="default"
          />
          <Link href="/dashboard/quotes">
            <Button variant="secondary" className="text-sm">
              ← Retour
            </Button>
          </Link>
        </div>
      </div>

      <QuoteEditClient
        quote={{
          id: quote.id,
          projectDescription: quote.projectDescription,
          serviceOfferId: quote.serviceOfferId,
          options: (quote.quoteOptions as any[]).map((qo: any) => ({
            ...qo.option,
            quantity: qo.quantity,
          })),
          status: quote.status,
        }}
        offers={(availableOffers as any[]).map((o: any) => ({
          id: o.id,
          title: o.title,
          priceLabel: o.priceLabel,
          durationDays: o.durationDays,
          includedOptionIds: o.offerOptions?.map((opt: any) => opt.id) ?? [],
        }))}
        options={availableOptions as any}
      />
    </Section>
  );
}
