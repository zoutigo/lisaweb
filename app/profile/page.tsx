export const runtime = "nodejs";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

export const metadata = {
  title: "Mon profil",
};

export default async function ProfilePage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session || !session.user?.email) redirect("/");

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[28px] bg-gradient-to-br from-[#f6f8ff] via-white to-[#f0f4ff] p-6 shadow-[0_20px_80px_-40px_rgba(27,38,83,0.35)] sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#5660a9]">
              Profil
            </p>
            <h1 className="text-3xl font-bold text-[#1b2653]">
              Espace personnel
            </h1>
            <p className="text-sm text-[#4b5563]">
              Retrouvez vos informations et vos rendez-vous en un clin
              d&apos;œil.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-[12px] px-5 py-3 text-xs font-semibold text-[#1b2653] transition cursor-pointer border border-white/80 bg-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.05)] hover:bg-white"
          >
            ← Retour
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/profile/mes-infos"
            className="group rounded-2xl border border-[#e5e7eb] bg-white/90 p-6 shadow-[0_14px_38px_-24px_rgba(27,38,83,0.35)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_-30px_rgba(27,38,83,0.45)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#3b5bff]">
                👤
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">
                Identité
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#1b2653]">
              Mes infos
            </h2>
            <p className="mt-1 text-sm text-[#4b5563]">
              Consulter ou mettre à jour vos coordonnées personnelles.
            </p>
          </Link>

          <Link
            href="/profile/mes-rdv"
            className="group rounded-2xl border border-[#e5e7eb] bg-white/90 p-6 shadow-[0_14px_38px_-24px_rgba(27,38,83,0.35)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_-30px_rgba(27,38,83,0.45)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ecfdf3] text-[#16a34a]">
                📅
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">
                Rendez-vous
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#1b2653]">
              Mes rendez-vous
            </h2>
            <p className="mt-1 text-sm text-[#4b5563]">
              Visualisez, modifiez ou annulez vos rendez-vous.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
