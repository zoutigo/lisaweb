"use client";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Section } from "@/components/section";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

const navLinks = [
  { label: "Nos offres", href: "/services-offers" },
  { label: "Méthode", href: "/methode" },
  { label: "FAQ", href: "/faq" },
  { label: "Réalisations", href: "/realisations" },
  { label: "Demande de devis", href: "/demande-devis" },
  { label: "Contact", href: "/contact" },
];

export function SiteFooter() {
  const { data } = useQuery({
    queryKey: ["siteInfo"],
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const res = await fetch("/api/site-info", { cache: "no-store" });
      return (await res.json()) as {
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        postalCode?: string;
        country?: string;
      } | null;
    },
  });
  const { data: partners } = useQuery({
    queryKey: ["partners-public"],
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const res = await fetch("/api/partners", { cache: "no-store" });
      return (await res.json()) as Array<{
        id: number;
        name: string;
        logoUrl: string | null;
        url: string | null;
      }>;
    },
  });

  const email = data?.email || "contact@valerymbele.fr";
  const phone = data?.phone || "+33 6 00 00 00 00";
  const addressLine = data?.address || "";
  const cityLine = [data?.postalCode, data?.city].filter(Boolean).join(" ");
  const countryLine = data?.country || "";

  return (
    <Section as="footer" className="pb-16 pt-0">
      <div className="grid gap-10 rounded-[24px] bg-[#f0f4ff] p-10 shadow-[0_16px_50px_-32px_rgba(27,38,83,0.25)] sm:grid-cols-[1.1fr_0.9fr] lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="cursor-pointer">
              <Logo size={80} />
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1b2653]">
                LISAWEB
              </p>
              <p className="text-sm text-[#4b5563]">
                Développeur web & mobiles
              </p>
            </div>
          </div>
          <p className="max-w-xl text-base text-[#374151]">
            LISAWEB crée et refond des sites vitrines modernes pour les écoles,
            associations, artisans et TPE de Pont-de-Chéruy, Charvieu, Tignieu
            et Lyon Est.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-[#1b2653]">
            <span className="rounded-full bg-[#edf1ff] px-3 py-1">
              Réponse sous 24h
            </span>
            <span className="rounded-full bg-[#edf1ff] px-3 py-1">
              Accompagnement humain
            </span>
          </div>
          {partners && partners.length ? (
            <div className="mt-3">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#1b2653]">
                Partenaires
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {partners.map((p) => (
                  <a
                    key={p.id}
                    href={p.url || "#"}
                    target={p.url ? "_blank" : undefined}
                    rel={p.url ? "noreferrer" : undefined}
                    className="inline-flex items-center justify-center"
                    aria-label={p.name}
                  >
                    <Image
                      src={p.logoUrl || "/partner-placeholder.svg"}
                      alt={p.name}
                      width={56}
                      height={56}
                      className="h-12 w-12 rounded-lg object-contain"
                    />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-3 text-sm text-[#374151]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1b2653]">
              Navigations
            </p>
            {navLinks.map((link) => (
              <a
                key={link.label}
                className="hover:text-[#1b2653]"
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-3 text-sm text-[#374151]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1b2653]">
              Zones
            </p>
            <div className="space-y-1">
              <p>Pont-de-Chéruy</p>
              <p>Charvieu / Tignieu</p>
              <p>Meyzieu / Lyon Est</p>
              <p className="mt-2 text-xs text-[#6b7280]">
                Disponibilité : rendez-vous en visio ou sur place.
              </p>
            </div>
            <div className="mt-2 space-y-1 text-sm text-[#1b2653]">
              <p>Email : {email}</p>
              <p>Tél : {phone}</p>
              {addressLine ? <p>{addressLine}</p> : null}
              {cityLine ? <p>{cityLine}</p> : null}
              {countryLine ? <p>{countryLine}</p> : null}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[#6b7280]">
        <span>
          © {new Date().getFullYear()} Valery Mbele. Tous droits réservés.
        </span>
        <div className="flex gap-4">
          <a className="hover:text-[#1b2653]" href="#">
            Mentions légales
          </a>
          <a className="hover:text-[#1b2653]" href="#">
            Politique de confidentialité
          </a>
        </div>
      </div>
    </Section>
  );
}
