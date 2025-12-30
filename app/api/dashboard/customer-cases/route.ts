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

export async function GET() {
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean((session?.user as { isAdmin?: boolean })?.isAdmin);
  if (!session || !session.user?.email || !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cases = await prisma.customerCase.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      results: { orderBy: { order: "asc" } },
      features: { orderBy: { order: "asc" } },
    },
  });
  return NextResponse.json(cases);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const isAdmin = Boolean((session?.user as { isAdmin?: boolean })?.isAdmin);
  if (!session || !session.user?.email || !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const created = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      if (data.isFeatured) {
        await tx.customerCase.updateMany({
          data: { isFeatured: false },
          where: { isFeatured: true },
        });
      }
      const createdCase = await tx.customerCase.create({
        data: {
          title: data.title,
          customer: data.customer,
          description: data.description,
          url: data.url,
          imageUrl: data.imageUrl,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          results: {
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
      return createdCase;
    },
  );
  return NextResponse.json(created, { status: 201 });
}
