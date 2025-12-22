export const runtime = "nodejs";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Session } from "next-auth";
import { UsersClient } from "./users-client";

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
      <UsersClient
        users={users.map((u) => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
