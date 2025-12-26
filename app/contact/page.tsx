import { prisma } from "@/lib/prisma";
import { Section } from "@/components/section";
import ContactClient from "./contact-client";

export const metadata = {
  title: "Contact",
  description:
    "Échangeons sur votre projet web : coordonnées, localisation et formulaire de contact.",
};

export default async function ContactPage() {
  const siteInfo = await prisma.siteInfo.findFirst();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9fc] via-white to-[#eef2ff] text-[#111827]">
      <Section className="pt-12 sm:pt-16">
        <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1b2653] to-[#3b5bff] px-6 py-10 text-white shadow-[0_25px_80px_-35px_rgba(0,0,0,0.55)] sm:px-12 sm:py-12">
          <div className="flex flex-col gap-4 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.26em] text-white/70">
              Contact
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Discutons de votre projet
            </h1>
            <p className="text-lg text-white/85">
              Je réponds rapidement et sans jargon. Précisez votre besoin et je
              reviens vers vous pour un premier échange.
            </p>
          </div>
        </div>
      </Section>

      <Section className="pb-16">
        <ContactClient initialSiteInfo={siteInfo} />
      </Section>
    </div>
  );
}
