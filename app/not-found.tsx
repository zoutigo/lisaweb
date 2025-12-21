"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl rounded-[28px] bg-gradient-to-br from-[#f6f8ff] via-white to-[#eef2ff] p-8 shadow-[0_20px_80px_-35px_rgba(27,38,83,0.4)] sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#6b7280]">
              Erreur 404
            </p>
            <h1 className="mt-1 text-3xl font-bold text-[#1b2653] sm:text-4xl">
              Page introuvable
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#4b5563]">
              Le chemin que vous cherchez n&apos;existe pas ou a été déplacé.
              Vérifiez l&apos;URL ou revenez à l&apos;accueil.
            </p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-xs text-[#4b5563] shadow-sm">
            <span className="font-semibold text-[#1b2653]">
              Raccourcis utiles
            </span>
            <ul className="mt-2 space-y-1">
              <li>Tableau de bord : /dashboard</li>
              <li>Site : /dashboard/site</li>
              <li>Utilisateurs : /dashboard/users</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="cursor-pointer rounded-full bg-[#3b5bff] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-12px_rgba(59,91,255,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-14px_rgba(59,91,255,0.65)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b5bff]"
          >
            Revenir en arrière
          </button>
          <Link
            href="/"
            className="cursor-pointer rounded-full border border-[#d1d5db] bg-white px-6 py-3 text-sm font-semibold text-[#1b2653] transition hover:-translate-y-0.5 hover:border-[#9ca3af] hover:shadow-sm"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/dashboard"
            className="cursor-pointer rounded-full border border-transparent bg-[#eef2ff] px-6 py-3 text-sm font-semibold text-[#3b5bff] transition hover:-translate-y-0.5 hover:bg-[#e0e7ff]"
          >
            Aller au dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
