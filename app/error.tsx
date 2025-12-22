"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl rounded-[28px] bg-gradient-to-br from-[#f6f8ff] via-white to-[#eef2ff] p-8 shadow-[0_20px_80px_-35px_rgba(27,38,83,0.4)] sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#6b7280]">
              Oups…
            </p>
            <h1 className="mt-1 text-3xl font-bold text-[#1b2653] sm:text-4xl">
              Quelque chose s&apos;est mal passé
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#4b5563]">
              Nous avons rencontré un problème. Vous pouvez réessayer ou revenir
              à l&apos;accueil.
            </p>
            {error?.message ? (
              <p className="mt-3 rounded-xl bg-white/70 px-4 py-3 text-xs text-[#6b7280] shadow-sm">
                {error.message}
              </p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-xs text-[#4b5563] shadow-sm">
            <span className="font-semibold text-[#1b2653]">
              Rapide à savoir
            </span>
            <ul className="mt-2 space-y-1">
              <li>Essayez de rafraîchir la page</li>
              <li>Vérifiez votre connexion</li>
              <li>Contactez-nous si le souci persiste</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className="cursor-pointer rounded-full bg-[#3b5bff] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-12px_rgba(59,91,255,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-14px_rgba(59,91,255,0.65)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b5bff]"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="cursor-pointer rounded-full border border-[#d1d5db] bg-white px-6 py-3 text-sm font-semibold text-[#1b2653] transition hover:-translate-y-0.5 hover:border-[#9ca3af] hover:shadow-sm"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/contact"
            className="cursor-pointer rounded-full border border-transparent bg-[#eef2ff] px-6 py-3 text-sm font-semibold text-[#3b5bff] transition hover:-translate-y-0.5 hover:bg-[#e0e7ff]"
          >
            Contacter le support
          </Link>
        </div>
      </div>
    </div>
  );
}
