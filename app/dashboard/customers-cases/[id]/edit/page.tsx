export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { CustomerCaseForm } from "../../customer-case-form";

export default async function EditCustomerCasePage({
  params,
}: {
  params: { id?: string } | Promise<{ id?: string }>;
}) {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session || !session.user?.email) redirect("/");
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;
  if (!isAdmin) redirect("/");

  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;
  if (!id || typeof id !== "string") {
    redirect("/dashboard/customers-cases");
  }

  const caseItem = await prisma.customerCase.findUnique({
    where: { id },
  });
  if (!caseItem) redirect("/dashboard/customers-cases");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <BackLink className="mb-4" />
      <CustomerCaseForm
        mode="edit"
        initialCase={{
          id: caseItem.id,
          title: caseItem.title,
          description: caseItem.description,
          isOnLandingPage: caseItem.isOnLandingPage ?? false,
          customer: caseItem.customer ?? undefined,
          url: caseItem.url ?? undefined,
          imageUrl: caseItem.imageUrl ?? undefined,
          result1: caseItem.result1 ?? undefined,
          result2: caseItem.result2 ?? undefined,
          result3: caseItem.result3 ?? undefined,
          result4: caseItem.result4 ?? undefined,
          result5: caseItem.result5 ?? undefined,
          feature1: caseItem.feature1 ?? undefined,
          feature2: caseItem.feature2 ?? undefined,
          feature3: caseItem.feature3 ?? undefined,
          feature4: caseItem.feature4 ?? undefined,
          feature5: caseItem.feature5 ?? undefined,
        }}
      />
    </div>
  );
}
