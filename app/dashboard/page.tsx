export const runtime = "nodejs";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Session } from "next-auth";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session || !session.user?.email) redirect("/");

  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;
  if (!isAdmin) redirect("/");

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[28px] bg-gradient-to-br from-[#f6f8ff] via-white to-[#f0f4ff] p-6 shadow-[0_20px_80px_-40px_rgba(27,38,83,0.35)] sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#5660a9]">
              Tableau de bord
            </p>
            <h1 className="text-3xl font-bold text-[#1b2653]">
              Espace administrateur
            </h1>
            <p className="text-sm text-[#4b5563]">
              Pilotez le site, les utilisateurs et vos partenaires en un clin
              d&apos;œil.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#1b2653]">
            <Link href="/" className="hidden sm:block">
              <Button variant="secondary" className="text-xs">
                ← Retour
              </Button>
            </Link>
            <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">
              Accès admin
            </span>
            <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">
              Dernière connexion
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard/site"
            className="group rounded-2xl border border-[#e5e7eb] bg-white/90 p-6 shadow-[0_14px_38px_-24px_rgba(27,38,83,0.35)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_-30px_rgba(27,38,83,0.45)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#3b5bff]">
                🛠️
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">
                Configuration
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#1b2653]">Site</h2>
            <p className="mt-1 text-sm text-[#4b5563]">
              Coordonnées, mentions et apparence globale.
            </p>
          </Link>

          <Link
            href="/dashboard/users"
            className="group rounded-2xl border border-[#e5e7eb] bg-white/90 p-6 shadow-[0_14px_38px_-24px_rgba(27,38,83,0.35)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_-30px_rgba(27,38,83,0.45)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ecfdf3] text-[#16a34a]">
                👥
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">
                Gestion
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#1b2653]">
              Utilisateurs
            </h2>
            <p className="mt-1 text-sm text-[#4b5563]">
              Comptes, rôles admin et coordination des accès.
            </p>
          </Link>

          <Link
            href="/dashboard/partners"
            className="group rounded-2xl border border-[#e5e7eb] bg-white/90 p-6 shadow-[0_14px_38px_-24px_rgba(27,38,83,0.35)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_-30px_rgba(27,38,83,0.45)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fef2f2] text-[#dc2626]">
                🤝
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">
                Réseau
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#1b2653]">
              Partenaires
            </h2>
            <p className="mt-1 text-sm text-[#4b5563]">
              Logos, liens et informations clés de vos partenaires.
            </p>
          </Link>

          <Link
            href="/dashboard/faq"
            className="group rounded-2xl border border-[#e5e7eb] bg-white/90 p-6 shadow-[0_14px_38px_-24px_rgba(27,38,83,0.35)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_-30px_rgba(27,38,83,0.45)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f3ff] text-[#7c3aed]">
                ❔
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">
                Contenu
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#1b2653]">FAQ</h2>
            <p className="mt-1 text-sm text-[#4b5563]">
              Gérez les questions/réponses affichées sur le site.
            </p>
          </Link>

          <Link
            href="/dashboard/customers-cases"
            className="group rounded-2xl border border-[#e5e7eb] bg-white/90 p-6 shadow-[0_14px_38px_-24px_rgba(27,38,83,0.35)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_-30px_rgba(27,38,83,0.45)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e0f2fe] text-[#0284c7]">
                ⭐
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">
                Réalisations
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#1b2653]">
              Cas clients
            </h2>
            <p className="mt-1 text-sm text-[#4b5563]">
              Ajoutez et maintenez les études de cas affichées sur la landing.
            </p>
          </Link>

          <Link
            href="/dashboard/service-offers"
            className="group rounded-2xl border border-[#e5e7eb] bg-white/90 p-6 shadow-[0_14px_38px_-24px_rgba(27,38,83,0.35)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_-30px_rgba(27,38,83,0.45)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#3b5bff]">
                💼
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">
                Offres
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#1b2653]">
              Formats d&apos;accompagnement
            </h2>
            <p className="mt-1 text-sm text-[#4b5563]">
              Gérez vos services, avantages et déroulé pour la landing.
            </p>
          </Link>

          <Link
            href="/dashboard/offer-options"
            className="group rounded-2xl border border-[#e5e7eb] bg-white/90 p-6 shadow-[0_14px_38px_-24px_rgba(27,38,83,0.35)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_-30px_rgba(27,38,83,0.45)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff7ed] text-[#f97316]">
                🧩
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">
                Modules
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#1b2653]">
              Options d&apos;offre
            </h2>
            <p className="mt-1 text-sm text-[#4b5563]">
              Gérez les modules complémentaires et tarifs associés aux offres.
            </p>
          </Link>

          <Link
            href="/dashboard/quotes"
            className="group rounded-2xl border border-[#e5e7eb] bg-white/90 p-6 shadow-[0_14px_38px_-24px_rgba(27,38,83,0.35)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_-30px_rgba(27,38,83,0.45)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#1d4ed8]">
                📄
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">
                Devis
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#1b2653]">
              Demandes de devis
            </h2>
            <p className="mt-1 text-sm text-[#4b5563]">
              Consultez les demandes soumises, formats choisis et options.
            </p>
          </Link>

          <Link
            href="/dashboard/rendezvous"
            className="group rounded-2xl border border-[#e5e7eb] bg-white/90 p-6 shadow-[0_14px_38px_-24px_rgba(27,38,83,0.35)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_-30px_rgba(27,38,83,0.45)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f5e9] text-[#2e7d32]">
                📅
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">
                Rendez-vous
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#1b2653]">RDV</h2>
            <p className="mt-1 text-sm text-[#4b5563]">
              Liste, validation et suivi des demandes de rendez-vous.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
