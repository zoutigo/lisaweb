/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type FaqRepo = {
  faqCategory: {
    count: (...args: any[]) => Promise<number>;
    createMany: (...args: any[]) => Promise<any>;
    findMany: (
      ...args: any[]
    ) => Promise<Array<{ id: string; name: string; order: number }>>;
  };
  faq: {
    findMany: (...args: any[]) => Promise<
      Array<{
        id: string;
        question: string;
        answer: string;
        createdAt: Date;
        categoryId?: string | null;
        category?: { id: string; name: string; order: number };
      }>
    >;
  };
};

const DEFAULT_CATEGORIES = [
  { name: "Général", order: 1 },
  { name: "Méthode & organisation", order: 2 },
  { name: "Technique & sécurité", order: 3 },
  { name: "Après la mise en ligne", order: 4 },
];

const faqRepo = prisma as unknown as FaqRepo;

async function ensureCategories() {
  const count = await faqRepo.faqCategory.count();
  if (count === 0) {
    await faqRepo.faqCategory.createMany({ data: DEFAULT_CATEGORIES });
  }
  return faqRepo.faqCategory.findMany({ orderBy: { order: "asc" } } as never);
}

export async function GET() {
  const categories = await ensureCategories();
  const faqs = await faqRepo.faq.findMany({
    orderBy: [{ category: { order: "asc" } }, { createdAt: "desc" }],
    include: { category: true },
  } as never);

  return NextResponse.json({ categories, faqs });
}
