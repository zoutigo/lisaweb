import { Logo } from "@/components/logo";
import { Section } from "@/components/section";

const navLinks = [
  { label: "Secteurs", href: "#sectors" },
  { label: "Méthode", href: "#process" },
  { label: "Réalisation", href: "#case" },
  { label: "Valeurs", href: "#values" },
  { label: "Contact", href: "#cta" },
];

export function SiteFooter() {
  return (
    <Section as="footer" className="pb-16 pt-0">
      <div className="grid gap-10 rounded-[24px] bg-white/90 p-10 shadow-[0_16px_50px_-32px_rgba(27,38,83,0.3)] sm:grid-cols-[1.1fr_0.9fr] lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Logo size={80} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1b2653]">
                LISAWEB
              </p>
              <p className="text-sm text-[#4b5563]">Développeur web & mobile</p>
            </div>
          </div>
          <p className="max-w-xl text-base text-[#374151]">
            LISAWEB crée et refond des sites vitrines modernes pour les écoles, associations,
            artisans et TPE de Pont-de-Chéruy, Charvieu, Tignieu et Lyon Est.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-[#1b2653]">
            <span className="rounded-full bg-[#edf1ff] px-3 py-1">Réponse sous 24h</span>
            <span className="rounded-full bg-[#edf1ff] px-3 py-1">Accompagnement humain</span>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-3 text-sm text-[#374151]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1b2653]">
              Navigation
            </p>
            {navLinks.map((link) => (
              <a key={link.label} className="hover:text-[#1b2653]" href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-3 text-sm text-[#374151]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1b2653]">
              Zones
            </p>
            <p>Pont-de-Chéruy</p>
            <p>Charvieu / Tignieu</p>
            <p>Meyzieu / Lyon Est</p>
            <p className="mt-2 text-xs text-[#6b7280]">
              Disponibilité : rendez-vous en visio ou sur place.
            </p>
            <div className="mt-2 text-sm text-[#1b2653]">
              <p>Email : contact@valerymbele.fr</p>
              <p>Tél : +33 6 00 00 00 00</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[#6b7280]">
        <span>© {new Date().getFullYear()} Valery Mbele. Tous droits réservés.</span>
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
