export const runtime = "nodejs";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Session } from "next-auth";

export default async function UsersPage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session || !session.user?.email) redirect("/");

  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;
  if (!isAdmin) redirect("/");

  let users: Array<{
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    email: string | null;
    isAdmin: boolean;
    createdAt: Date;
  }> = [];
  try {
    users = await (
      prisma as unknown as { user: typeof prisma.user }
    ).user.findMany({
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        isAdmin: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (e: unknown) {
    console.error("Prisma users error:", e);
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="mb-6 text-2xl font-bold">Utilisateurs</h1>
        <div className="text-red-600">
          Erreur base de données: {String((e as Error)?.message || e)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Administration
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="secondary" className="text-xs sm:text-sm">
              ← Retour
            </Button>
          </Link>
          <div className="text-sm text-gray-500">
            {users.length} utilisateur{users.length > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Mobile-first cards */}
      <div className="mt-6 grid gap-4 md:hidden">
        {users.map((u) => (
          <div
            key={u.id}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Prénom</p>
                <p className="font-semibold text-gray-900">{u.firstName}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  u.isAdmin
                    ? "bg-blue-50 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {u.isAdmin ? "Admin" : "Utilisateur"}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <p className="text-gray-500">Nom</p>
                <p className="font-medium text-gray-800">{u.lastName}</p>
              </div>
              <div>
                <p className="text-gray-500">Nom complet</p>
                <p className="font-medium text-gray-800">{u.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Téléphone</p>
                <p className="font-medium text-gray-800">{u.phone || "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-gray-800 break-words">
                  {u.email}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Link
                href={`/dashboard/users/${u.id}`}
                className="inline-flex items-center justify-center rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-800 hover:border-blue-300 hover:text-blue-700"
              >
                Voir
              </Link>
              <Link
                href={`/dashboard/users/${u.id}/edit`}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Modifier
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
        <table className="w-full table-auto">
          <thead className="bg-gray-50 text-sm font-semibold text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Prénom</th>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Nom complet</th>
              <th className="px-4 py-3 text-left">Téléphone</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Admin</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/60">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {u.firstName}
                </td>
                <td className="px-4 py-3">{u.lastName}</td>
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.phone || "—"}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      u.isAdmin
                        ? "bg-blue-50 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {u.isAdmin ? "Admin" : "Utilisateur"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/users/${u.id}`}
                      className="inline-flex items-center justify-center rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-800 hover:border-blue-300 hover:text-blue-700"
                    >
                      Voir
                    </Link>
                    <Link
                      href={`/dashboard/users/${u.id}/edit`}
                      className="inline-flex items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Modifier
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
