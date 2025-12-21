export const runtime = "nodejs";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserActions } from "./actions";
import { Button } from "@/components/ui/button";
import type { Session } from "next-auth";

export default async function UserViewPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  if (!id) redirect("/dashboard/users");

  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session || !session.user?.email) redirect("/");

  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;
  if (!isAdmin) redirect("/");

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) redirect("/dashboard/users");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Fiche utilisateur
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
        </div>
        <Link href="/dashboard/users">
          <Button variant="secondary" className="text-xs sm:text-sm">
            ← Retour
          </Button>
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-lg font-semibold text-blue-700">
              {(user.firstName || user.name || "U")[0]}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {user.name || "—"}
              </p>
            </div>
          </div>

          <dl className="mt-6 space-y-3 text-sm text-gray-800">
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-gray-500">
                Prénom
              </dt>
              <dd className="mt-1 font-medium text-gray-900">
                {user.firstName || "—"}
              </dd>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-gray-500">
                Nom
              </dt>
              <dd className="mt-1 font-medium text-gray-900">
                {user.lastName || "—"}
              </dd>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-gray-500">
                Téléphone
              </dt>
              <dd className="mt-1 font-medium text-gray-900">
                {user.phone || "—"}
              </dd>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-gray-500">
                Email
              </dt>
              <dd className="mt-1 break-words font-medium text-gray-900">
                {user.email}
              </dd>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-gray-500">
                Rôle
              </dt>
              <dd className="mt-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    user.isAdmin
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {user.isAdmin ? "Admin" : "Utilisateur"}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 sm:px-6">
          <UserActions userId={user.id} />
        </div>
      </div>
    </div>
  );
}
