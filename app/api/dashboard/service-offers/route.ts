import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { serviceOfferSchema } from "@/lib/validations/service-offer";

export const runtime = "nodejs";

type SessionUser = { email?: string | null; isAdmin?: boolean };

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean((session?.user as SessionUser)?.isAdmin);
  if (!session || !session.user?.email || !isAdmin) return null;
  return session;
}

export async function GET() {
  const session = await ensureAdmin();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const offers = await prisma.serviceOffer.findMany({
    orderBy: { order: "asc" },
    include: { features: true, steps: true, useCases: true },
  });
  return NextResponse.json(offers);
}

export async function POST(req: Request) {
  const session = await ensureAdmin();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = serviceOfferSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const created = await prisma.$transaction(async (tx) => {
    if (data.isFeatured) {
      await tx.serviceOffer.updateMany({
        data: { isFeatured: false },
        where: { isFeatured: true },
      });
    }
    const offer = await tx.serviceOffer.create({
      data: {
        slug: data.slug,
        title: data.title,
        subtitle: data.subtitle || null,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        targetAudience: data.targetAudience,
        priceLabel: data.priceLabel,
        durationLabel: data.durationLabel,
        engagementLabel: data.engagementLabel,
        isFeatured: data.isFeatured ?? false,
        order: data.order ?? 0,
        ctaLabel: data.ctaLabel,
        ctaLink: data.ctaLink,
      },
    });
    if (data.offerOptionIds?.length) {
      await tx.serviceOffer.update({
        where: { id: offer.id },
        data: {
          offerOptions: {
            connect: data.offerOptionIds.map((id) => ({ id })),
          },
        },
      });
    }
    if (data.features?.length) {
      await tx.serviceOfferFeature.createMany({
        data: data.features.map((f, idx) => ({
          offerId: offer.id,
          label: f.label,
          icon: f.icon || null,
          order: f.order ?? idx,
        })),
      });
    }
    if (data.steps?.length) {
      await tx.serviceOfferStep.createMany({
        data: data.steps.map((s, idx) => ({
          offerId: offer.id,
          title: s.title,
          description: s.description,
          order: s.order ?? idx,
        })),
      });
    }
    if (data.useCases?.length) {
      await tx.serviceOfferUseCase.createMany({
        data: data.useCases.map((u) => ({
          offerId: offer.id,
          title: u.title,
          description: u.description,
        })),
      });
    }
    const fresh = await tx.serviceOffer.findUnique({
      where: { id: offer.id },
      include: {
        features: true,
        steps: true,
        useCases: true,
        offerOptions: true,
      },
    });
    return fresh
      ? {
          ...fresh,
          features: fresh.features.map((f) => ({
            ...f,
            icon: f.icon ?? null,
            order: f.order ?? 0,
          })),
          steps: fresh.steps.map((s) => ({
            ...s,
            order: s.order ?? 0,
          })),
          useCases: fresh.useCases,
          offerOptions: fresh.offerOptions,
        }
      : null;
  });

  return NextResponse.json(created, { status: 201 });
}
