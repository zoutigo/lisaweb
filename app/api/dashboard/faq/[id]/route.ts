import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { faqSchema } from "@/lib/validations/faq";

type SessionUser = { email?: string | null; isAdmin?: boolean };
type RouteContext = { params: Promise<{ id: string }> };

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return {
      ok: false,
      res: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }
  const user = session.user as SessionUser;
  if (!user?.isAdmin) {
    return {
      ok: false,
      res: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true as const };
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const adminCheck = await ensureAdmin();
  if (!adminCheck.ok) return adminCheck.res;

  const { id } = await context.params;
  const faqId = Number(id);
  if (!faqId || Number.isNaN(faqId)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }
  const faq = await prisma.faq.findUnique({ where: { id: faqId } });
  if (!faq) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(faq);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const adminCheck = await ensureAdmin();
  if (!adminCheck.ok) return adminCheck.res;

  const { id } = await context.params;
  const faqId = Number(id);
  if (!faqId || Number.isNaN(faqId)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = faqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid data" }, { status: 422 });
  }

  const updated = await prisma.faq.update({
    where: { id: faqId },
    data: {
      question: parsed.data.question,
      answer: parsed.data.answer,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const adminCheck = await ensureAdmin();
  if (!adminCheck.ok) return adminCheck.res;

  const { id } = await context.params;
  const faqId = Number(id);
  if (!faqId || Number.isNaN(faqId)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  await prisma.faq.delete({ where: { id: faqId } });
  return NextResponse.json({ ok: true });
}
