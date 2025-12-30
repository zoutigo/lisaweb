export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { CustomerCaseForm } from "../../customer-case-form";

type CaseOption = { id: string; label: string; slug: string };

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
    include: { results: true, features: true },
  });
  if (!caseItem) redirect("/dashboard/customers-cases");

  const [allResults, allFeatures] = await Promise.all([
    prisma.customerCaseResult.findMany({ orderBy: { order: "asc" } }),
    prisma.customerCaseFeature.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <BackLink className="mb-4" />
      <CustomerCaseForm
        mode="edit"
        initialCase={{
          id: caseItem.id,
          title: caseItem.title,
          description: caseItem.description,
          isActive: caseItem.isActive ?? true,
          isFeatured: caseItem.isFeatured ?? false,
          customer: caseItem.customer ?? undefined,
          url: caseItem.url ?? undefined,
          imageUrl: caseItem.imageUrl ?? undefined,
          results:
            caseItem.results?.map((r: CaseOption) => ({
              id: r.id,
              label: r.label,
              slug: r.slug,
            })) ?? [],
          features:
            caseItem.features?.map((f: CaseOption) => ({
              id: f.id,
              label: f.label,
              slug: f.slug,
            })) ?? [],
        }}
        availableResults={allResults.map((r: CaseOption) => ({
          id: r.id,
          label: r.label,
          slug: r.slug,
        }))}
        availableFeatures={allFeatures.map((f: CaseOption) => ({
          id: f.id,
          label: f.label,
          slug: f.slug,
        }))}
      />
    </div>
  );
}
