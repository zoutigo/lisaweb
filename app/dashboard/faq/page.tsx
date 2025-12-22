export const runtime = "nodejs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FaqClient from "./faq-client";
import type { Session } from "next-auth";

export const metadata = {
  title: "FAQ",
};

export default async function FaqPage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session || !session.user?.email) redirect("/");
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;
  if (!isAdmin) redirect("/");

  const faqs = await prisma.faq.findMany({
    orderBy: { createdAt: "desc" },
  });

  const initialFaqs = faqs.map(
    (f: { id: number; question: string; answer: string; createdAt: Date }) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      createdAt: f.createdAt.toISOString(),
    }),
  );

  return <FaqClient initialFaqs={initialFaqs} />;
}
