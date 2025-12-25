import { prisma } from "@/lib/prisma";
import { customerCaseSchema } from "@/lib/validations/customer-case";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

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

  const updated = await prisma.customerCase.update({
    where: { id: rawId },
    data: {
      ...parsed.data,
      customer: parsed.data.customer || null,
      url: parsed.data.url || null,
      imageUrl: parsed.data.imageUrl || null,
    },
  });
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
