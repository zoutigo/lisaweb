"use client";

import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Secteurs", href: "#sectors" },
  { label: "Méthode", href: "#process" },
  { label: "Réalisation", href: "#case" },
  { label: "Valeurs", href: "#values" },
  { label: "Contact", href: "#cta" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-white/90 backdrop-blur-lg">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-1 sm:px-5 sm:py-2">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Logo size={80} className="h-8 w-8 md:h-8 md:w-8" />
          <div className="leading-tight">
            <p className="text-[16px] font-semibold uppercase tracking-[0.16em] text-[#1b2653] sm:text-[11px]">
              LisaWeb
            </p>
            <p className="text-[11px] text-[#4b5563] md:block">
              Développeur web & mobile
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-5 text-sm font-semibold text-[#1b2653] md:flex">
          {links.map((link) => (
            <a key={link.label} className="hover:text-[#3b5bff]" href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button className="h-8 items-center px-3.5 py-0 text-xs md:h-8 md:px-4 md:py-0 md:text-sm">
            Prendre un rendez-vous
          </Button>
        </div>

        <button
          type="button"
          aria-label="Ouvrir le menu"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#1b2653] shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:bg-[#f7f9fc] md:hidden"
        >
          <span className="sr-only">Menu</span>
          <div className="flex flex-col gap-1">
            <span className="h-0.5 w-4 rounded-full bg-current" />
            <span className="h-0.5 w-4 rounded-full bg-current" />
            <span className="h-0.5 w-4 rounded-full bg-current" />
          </div>
        </button>

        {open ? (
          <div className="absolute right-3 top-[calc(100%+8px)] w-[220px] rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.12)] md:hidden">
            <div className="flex flex-col gap-3 text-sm font-semibold text-[#1b2653]">
              {links.map((link) => (
                <a
                  key={link.label}
                  className="rounded-lg px-2 py-2 hover:bg-[#f7f9fc]"
                  href={link.href}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Button className="h-9 w-full justify-center px-4 py-0 text-xs">
                Prendre un rendez-vous
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
