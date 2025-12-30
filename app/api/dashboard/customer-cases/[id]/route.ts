import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { customerCaseSchema } from "@/lib/validations/customer-case";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function slugifyLabel(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function guard() {
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean((session?.user as { isAdmin?: boolean })?.isAdmin);
  if (!session || !session.user?.email || !isAdmin) {
    return null;
  }
  return session;
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } } | { params: Promise<{ id: string }> },
) {
  const session = await guard();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: rawId } = await (params as
    | { id: string }
    | Promise<{ id: string }>);
  if (!rawId)
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const json = await req.json();
  const parsed = customerCaseSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = {
    ...parsed.data,
    isActive: parsed.data.isActive ?? true,
    isFeatured: parsed.data.isFeatured ?? false,
    customer: parsed.data.customer || null,
    url: parsed.data.url || null,
    imageUrl: parsed.data.imageUrl || null,
    results: parsed.data.results ?? [],
    features: parsed.data.features ?? [],
  };

  const updated = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      if (data.isFeatured) {
        await tx.customerCase.updateMany({
          data: { isFeatured: false },
          where: { isFeatured: true, NOT: { id: rawId } },
        });
      }
      const updatedCase = await tx.customerCase.update({
        where: { id: rawId },
        data: {
          title: data.title,
          customer: data.customer,
          description: data.description,
          url: data.url,
          imageUrl: data.imageUrl,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          results: {
            set: [],
            connectOrCreate: data.results.map((r, idx) => ({
              where: { slug: r.slug ?? slugifyLabel(r.label) },
              create: {
                slug: r.slug ?? slugifyLabel(r.label),
                label: r.label,
                order: idx,
              },
            })),
          },
          features: {
            set: [],
            connectOrCreate: data.features.map((f, idx) => ({
              where: { slug: f.slug ?? slugifyLabel(f.label) },
              create: {
                slug: f.slug ?? slugifyLabel(f.label),
                label: f.label,
                order: idx,
              },
            })),
          },
        },
        include: {
          results: { orderBy: { order: "asc" } },
          features: { orderBy: { order: "asc" } },
        },
      });

      return updatedCase;
    },
  );
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } } | { params: Promise<{ id: string }> },
) {
  const session = await guard();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: rawId } = await (params as
    | { id: string }
    | Promise<{ id: string }>);
  if (!rawId)
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await prisma.customerCase.delete({ where: { id: rawId } });
  return NextResponse.json({ ok: true });
}
