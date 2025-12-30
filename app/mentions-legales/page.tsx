import { prisma } from "@/lib/prisma";
import { fallbackSiteInfo } from "@/lib/data/fallback-site-info";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mentions légales | LISAWEB",
  description:
    "Informations légales de LISAWEB : éditeur, hébergeur, propriété intellectuelle, données personnelles et cookies.",
};

async function getSiteInfo() {
  try {
    return (await prisma.siteInfo.findFirst()) ?? null;
  } catch {
    return null;
  }
}

export default async function MentionsLegalesPage() {
  const siteInfo = (await getSiteInfo()) ?? fallbackSiteInfo;

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-[#1b2653]">Mentions légales</h1>
      <p className="mt-2 text-sm text-gray-600">
        Conformément à la loi n°2004-575 du 21 juin 2004 pour la confiance dans
        l’économie numérique (LCEN), vous trouverez ci-dessous l’identité des
        intervenants du site lisaweb.fr.
      </p>

      <section className="mt-8 space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-[#1b2653]">Éditeur</h2>
        <p className="text-sm text-gray-800">
          Nom commercial : {siteInfo.name ?? "LISAWEB"}
        </p>
        <p className="text-sm text-gray-800">
          Responsable de la publication :{" "}
          {siteInfo.responsable ?? "Valery Mbele"}
        </p>
        <p className="text-sm text-gray-800">
          Statut :{" "}
          {siteInfo.statut ?? "Entrepreneur individuel / Auto-entrepreneur"}
        </p>
        <p className="text-sm text-gray-800">
          Adresse :{" "}
          {siteInfo.address || siteInfo.city
            ? `${siteInfo.address ? `${siteInfo.address}, ` : ""}${siteInfo.city ?? ""} ${
                siteInfo.country ?? ""
              }`
            : "—"}
        </p>
        <p className="text-sm text-gray-800">Email : {siteInfo.email}</p>
        <p className="text-sm text-gray-800">
          Téléphone : {siteInfo.phone ?? "+33 6 00 00 00 00"}
        </p>
        <p className="text-sm text-gray-800">
          SIRET :{" "}
          {siteInfo.siret && siteInfo.siret.trim()
            ? siteInfo.siret
            : "à renseigner"}
        </p>
        <p className="text-sm text-gray-800">
          Code APE :{" "}
          {siteInfo.codeApe && siteInfo.codeApe.trim()
            ? siteInfo.codeApe
            : "(optionnel)"}
        </p>
        <p className="text-sm text-gray-800">
          Le responsable de la publication est une personne physique.
        </p>
      </section>

      <section className="mt-6 space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-[#1b2653]">Hébergement</h2>
        <p className="text-sm text-gray-800">Hébergeur : o2switch</p>
        <p className="text-sm text-gray-800">Raison sociale : o2switch</p>
        <p className="text-sm text-gray-800">
          Adresse : Chemin des Pardiaux, 63000 Clermont-Ferrand, France
        </p>
        <p className="text-sm text-gray-800">Téléphone : 04 44 44 60 40</p>
        <p className="text-sm text-blue-700">
          Site web :{" "}
          <a
            href="https://www.o2switch.fr"
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            https://www.o2switch.fr
          </a>
        </p>
      </section>

      <section className="mt-6 space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-[#1b2653]">
          Propriété intellectuelle
        </h2>
        <p className="text-sm text-gray-800">
          L’ensemble du contenu du site lisaweb.fr (textes, images, graphismes,
          logo, icônes, structure, code source) est la propriété exclusive de
          LISAWEB, sauf mention contraire. Toute reproduction, représentation ou
          adaptation, totale ou partielle, est interdite sans autorisation
          écrite.
        </p>
      </section>

      <section className="mt-6 space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-[#1b2653]">Responsabilité</h2>
        <p className="text-sm text-gray-800">
          L’éditeur s’efforce de fournir des informations exactes et à jour sur
          lisaweb.fr. Il ne peut toutefois être tenu responsable des omissions,
          inexactitudes ou carences dans la mise à jour. L’utilisateur exploite
          les informations sous sa seule responsabilité.
        </p>
      </section>

      <section className="mt-6 space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-[#1b2653]">
          Données personnelles
        </h2>
        <p className="text-sm text-gray-800">
          Les informations collectées via les formulaires sont destinées
          uniquement à LISAWEB et ne sont jamais cédées à des tiers.
          Conformément au RGPD, vous disposez d’un droit d’accès, de
          rectification et de suppression de vos données. Pour exercer ce droit
          : {siteInfo.email}.
        </p>
      </section>

      <section className="mt-6 space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-[#1b2653]">Cookies</h2>
        <p className="text-sm text-gray-800">
          Le site lisaweb.fr peut utiliser des cookies strictement nécessaires à
          son fonctionnement ou à des fins de mesure d’audience. Vous pouvez
          paramétrer votre navigateur pour accepter ou refuser les cookies.
        </p>
      </section>
    </main>
  );
}
