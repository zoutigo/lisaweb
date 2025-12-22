import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { faqSchema } from "@/lib/validations/faq";

type SessionUser = { email?: string | null; isAdmin?: boolean };

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as SessionUser;
  if (!user?.isAdmin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const faqs = await prisma.faq.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(faqs);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as SessionUser;
  if (!user?.isAdmin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = faqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid data" }, { status: 422 });
  }

  const created = await prisma.faq.create({
    data: {
      question: parsed.data.question,
      answer: parsed.data.answer,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
