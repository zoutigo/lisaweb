"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useSession, signIn, signOut } from "next-auth/react";

const links = [
  { label: "Secteurs", href: "#sectors" },
  { label: "Méthode", href: "/methode" },
  { label: "Réalisation", href: "#case" },
  { label: "Valeurs", href: "#values" },
  { label: "Contact", href: "#cta" },
];

export function SiteHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();
  const isAdmin = Boolean((session?.user as { isAdmin?: boolean })?.isAdmin);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: PointerEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-white/90 backdrop-blur-lg">
      <div
        ref={headerRef}
        className="relative mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-1 sm:px-5 sm:py-2"
      >
        <button
          type="button"
          aria-label="Retour à l'accueil"
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Logo size={80} className="h-8 w-8 md:h-8 md:w-8" />
          <div className="leading-tight text-left">
            <p className="text-[16px] font-semibold uppercase tracking-[0.16em] text-[#1b2653] sm:text-[11px]">
              LisaWeb
            </p>
            <p className="text-[11px] text-[#4b5563] md:block">
              Développeur web & mobile
            </p>
          </div>
        </button>

        <nav className="hidden">
          {links.map((link) => (
            <a
              key={link.label}
              className="hover:text-[#3b5bff]"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#1b2653] shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:bg-[#f7f9fc]"
        >
          <span className="sr-only">Menu</span>
          {open ? (
            <div className="relative h-4 w-4">
              <span className="absolute left-0 top-1/2 block h-0.5 w-4 -translate-y-1/2 rotate-45 rounded-full bg-current transition" />
              <span className="absolute left-0 top-1/2 block h-0.5 w-4 -translate-y-1/2 -rotate-45 rounded-full bg-current transition" />
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="h-0.5 w-4 rounded-full bg-current" />
              <span className="h-0.5 w-4 rounded-full bg-current" />
              <span className="h-0.5 w-4 rounded-full bg-current" />
            </div>
          )}
        </button>

        {open ? (
          <div className="absolute right-3 top-[calc(100%+8px)] w-[220px] rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
            <div className="flex flex-col gap-3 text-sm font-semibold text-[#1b2653]">
              {links.map((link) => (
                <a
                  key={link.label}
                  className="rounded-lg px-2 py-2 hover:bg-[#f7f9fc]"
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    router.push(link.href);
                  }}
                >
                  {link.label}
                </a>
              ))}
              <Button
                className="h-9 w-full justify-center px-4 py-0 text-xs cursor-pointer"
                onClick={() => {
                  router.push("/rendezvous");
                  setOpen(false);
                }}
              >
                Prendre un rendez-vous
              </Button>
              <Button
                className="h-9 w-full justify-center px-4 py-0 text-xs cursor-pointer"
                onClick={() => {
                  setOpen(false);
                  if (session) {
                    signOut({ callbackUrl: "/" });
                  } else {
                    signIn("google");
                  }
                }}
              >
                {session ? "Se déconnecter" : "Se connecter"}
              </Button>
              {session ? (
                <Button
                  className="h-9 w-full justify-center px-4 py-0 text-xs cursor-pointer"
                  onClick={() => {
                    router.push("/profile");
                    setOpen(false);
                  }}
                  variant="secondary"
                >
                  Mon profil
                </Button>
              ) : null}
              {isAdmin ? (
                <Button
                  className="h-9 w-full justify-center px-4 py-0 text-xs cursor-pointer"
                  onClick={() => {
                    router.push("/dashboard");
                    setOpen(false);
                  }}
                >
                  Dashboard
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
