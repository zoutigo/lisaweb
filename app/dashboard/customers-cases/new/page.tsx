export const runtime = "nodejs";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Session } from "next-auth";
import { BackLink } from "@/components/back-link";
import { CustomerCaseForm } from "../customer-case-form";

export default async function NewCustomerCasePage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session || !session.user?.email) redirect("/");
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;
  if (!isAdmin) redirect("/");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <BackLink className="mb-4" />
      <CustomerCaseForm mode="create" />
    </div>
  );
}
