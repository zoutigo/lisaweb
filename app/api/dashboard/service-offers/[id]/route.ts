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

export async function PUT(
  req: Request,
  { params }: { params: { id: string } } | { params: Promise<{ id: string }> },
) {
  const session = await ensureAdmin();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await (params as { id: string } | Promise<{ id: string }>);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json();
  const parsed = serviceOfferSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    if (data.isFeatured) {
      await tx.serviceOffer.updateMany({
        data: { isFeatured: false },
        where: { isFeatured: true, NOT: { id } },
      });
    }
    const offer = await tx.serviceOffer.update({
      where: { id },
      data: {
        slug: data.slug,
        title: data.title,
        subtitle: data.subtitle || null,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        targetAudience: data.targetAudience,
        priceLabel: data.priceLabel,
        durationDays: data.durationDays ?? 0,
        durationLabel: data.durationLabel,
        engagementLabel: data.engagementLabel,
        isFeatured: data.isFeatured ?? false,
        order: data.order ?? 0,
        ctaLabel: data.ctaLabel,
        ctaLink: data.ctaLink,
      },
    });

    await tx.serviceOffer.update({
      where: { id },
      data: {
        offerOptions: {
          set: [],
          connect: (data.offerOptionIds ?? []).map((oid) => ({ id: oid })),
        },
      },
    });

    await tx.serviceOfferFeature.deleteMany({ where: { offerId: id } });
    await tx.serviceOfferStep.deleteMany({ where: { offerId: id } });
    await tx.serviceOfferUseCase.deleteMany({ where: { offerId: id } });

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

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } } | { params: Promise<{ id: string }> },
) {
  const session = await ensureAdmin();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await (params as { id: string } | Promise<{ id: string }>);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await prisma.$transaction(async (tx) => {
    await tx.serviceOfferFeature.deleteMany({ where: { offerId: id } });
    await tx.serviceOfferStep.deleteMany({ where: { offerId: id } });
    await tx.serviceOfferUseCase.deleteMany({ where: { offerId: id } });
    await tx.serviceOffer.delete({ where: { id } });
  });
  return NextResponse.json({ ok: true });
}
