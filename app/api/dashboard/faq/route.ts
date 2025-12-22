/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { faqSchema } from "@/lib/validations/faq";

type SessionUser = { email?: string | null; isAdmin?: boolean };
type FaqRepo = {
  faq: {
    findMany: (...args: any[]) => Promise<any>;
    create: (...args: any[]) => Promise<any>;
  };
  faqCategory: {
    count: (...args: any[]) => Promise<number>;
    createMany: (...args: any[]) => Promise<any>;
    findMany: (...args: any[]) => Promise<any>;
  };
};
const faqRepo = prisma as unknown as FaqRepo;

const DEFAULT_CATEGORIES = [
  { name: "Général", order: 1 },
  { name: "Méthode & organisation", order: 2 },
  { name: "Technique & sécurité", order: 3 },
  { name: "Après la mise en ligne", order: 4 },
];

async function ensureCategories() {
  const count = await faqRepo.faqCategory.count();
  if (count === 0) {
    await faqRepo.faqCategory.createMany({ data: DEFAULT_CATEGORIES });
  }
  return faqRepo.faqCategory.findMany({ orderBy: { order: "asc" } } as never);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as SessionUser;
  if (!user?.isAdmin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const categories = await ensureCategories();
  const faqs = await faqRepo.faq.findMany({
    orderBy: [{ category: { order: "asc" } }, { createdAt: "desc" }],
  } as never);
  return NextResponse.json({ faqs, categories });
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

  const categories = await ensureCategories();
  const categoryId = parsed.data.categoryId || categories[0]?.id;
  if (!categoryId) {
    return NextResponse.json(
      { message: "No category available" },
      { status: 400 },
    );
  }

  const created = await faqRepo.faq.create({
    data: {
      question: parsed.data.question,
      answer: parsed.data.answer,
      categoryId,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
