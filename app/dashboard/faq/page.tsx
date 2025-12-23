/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FaqClient from "./faq-client";
import type { Session } from "next-auth";
type FaqRepo = {
  faq: {
    findMany: (...args: any[]) => Promise<any>;
  };
  faqCategory: {
    findMany: (...args: any[]) => Promise<any>;
    createMany: (...args: any[]) => Promise<any>;
  };
};
const faqRepo = prisma as unknown as FaqRepo;
type FaqRow = {
  id: number;
  question: string;
  answer: string;
  createdAt: Date;
  categoryId?: number;
};

export const metadata = {
  title: "FAQ",
};

export default async function FaqPage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session || !session.user?.email) redirect("/");
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;
  if (!isAdmin) redirect("/");

  const categoriesExisting = await faqRepo.faqCategory.findMany({
    orderBy: { order: "asc" },
  } as never);
  if (categoriesExisting.length === 0) {
    await faqRepo.faqCategory.createMany({
      data: [
        { name: "Général", order: 1 },
        { name: "Méthode & organisation", order: 2 },
        { name: "Technique & sécurité", order: 3 },
        { name: "Après la mise en ligne", order: 4 },
      ],
    });
  }
  const categories =
    categoriesExisting.length > 0
      ? categoriesExisting
      : await faqRepo.faqCategory.findMany({
          orderBy: { order: "asc" },
        } as never);

  const faqs = (await faqRepo.faq.findMany({
    orderBy: [{ category: { order: "asc" } }, { createdAt: "desc" }],
  } as never)) as FaqRow[];

  const initialFaqs = faqs.map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
    createdAt: f.createdAt.toISOString(),
    categoryId: f.categoryId ?? (categories[0]?.id || 1),
  }));

  return <FaqClient initialFaqs={initialFaqs} categories={categories} />;
}
