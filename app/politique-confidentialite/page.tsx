import { prisma } from "@/lib/prisma";
import { fallbackSiteInfo } from "@/lib/data/fallback-site-info";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Politique de confidentialité | LISAWEB",
  description:
    "Politique de confidentialité de LISAWEB : traitement des données personnelles, conservation, sécurité, droits RGPD.",
};

async function getSiteInfo() {
  try {
    return (await prisma.siteInfo.findFirst()) ?? null;
  } catch {
    return null;
  }
}

export default async function PrivacyPolicyPage() {
  const siteInfo = (await getSiteInfo()) ?? fallbackSiteInfo;
  const today = new Date().toLocaleDateString("fr-FR");
  const displayAddress =
    siteInfo.address || siteInfo.city
      ? `${siteInfo.address ? `${siteInfo.address}, ` : ""}${siteInfo.city ?? ""} ${
          siteInfo.country ?? ""
        }`
      : "Pont-de-Chéruy, France";

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-[#1b2653]">
        Politique de confidentialité
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Dernière mise à jour : {today}
      </p>

      <section className="mt-8 space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-[#1b2653]">
          1. Introduction
        </h2>
        <p className="text-sm text-gray-800">
          Cette politique explique comment vos données personnelles sont
          collectées et utilisées sur le site
          {` ${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lisaweb.fr"}`}.
          Les traitements sont conformes au RGPD et à la législation française.
        </p>
      </section>

      <section className="mt-6 space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-[#1b2653]">
          2. Responsable du traitement
        </h2>
        <p className="text-sm text-gray-800">
          Nom : {siteInfo.responsable || "Valery Mbele"} —{" "}
          {siteInfo.statut || "Développeur web & mobile"}
        </p>
        <p className="text-sm text-gray-800">
          Site web :{" "}
          {process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lisaweb.fr"}
        </p>
        <p className="text-sm text-gray-800">Email : {siteInfo.email}</p>
        <p className="text-sm text-gray-800">Localisation : {displayAddress}</p>
      </section>

      <section className="mt-6 space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-[#1b2653]">
          3. Données personnelles collectées
        </h2>
        <p className="text-sm text-gray-800">
          Données fournies volontairement : nom, prénom, email, téléphone,
          organisation, contenu des messages (contact, devis, rendez-vous).
        </p>
        <p className="text-sm text-gray-800">
          Collecte limitée aux formulaires (contact, demande de devis, prise de
          rendez-vous).
        </p>
      </section>

      <section className="mt-6 space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-[#1b2653]">4. Finalités</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-800">
          <li>Répondre aux demandes de contact ou de devis.</li>
          <li>Échanger dans le cadre d’un projet web ou mobile.</li>
          <li>Établir et suivre une proposition commerciale.</li>
          <li>Assurer le suivi client.</li>
        </ul>
        <p className="text-sm text-gray-800">
          Aucune donnée n’est utilisée à des fins publicitaires sans
          consentement.
        </p>
      </section>

      <section className="mt-6 space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-[#1b2653]">5. Base légale</h2>
        <p className="text-sm text-gray-800">
          Consentement explicite (formulaires) et intérêt légitime pour répondre
          aux demandes.
        </p>
      </section>

      <section className="mt-6 space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-[#1b2653]">
          6. Durée de conservation
        </h2>
        <p className="text-sm text-gray-800">
          Prospects : 3 ans après le dernier contact. Clients : 5 ans
          (obligations administratives et comptables). Emails : durée légale
          d’archivage si nécessaire.
        </p>
      </section>

      <section className="mt-6 space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-[#1b2653]">
          7. Destinataires
        </h2>
        <p className="text-sm text-gray-800">
          Données strictement confidentielles, non vendues, non louées, non
          transmises à des tiers. Accès réservé au responsable du site.
        </p>
      </section>

      <section className="mt-6 space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-[#1b2653]">
          8. Hébergement et sécurité
        </h2>
        <p className="text-sm text-gray-800">
          Hébergement dans l’Union Européenne. Mesures mises en œuvre pour
          prévenir tout accès non autorisé, perte ou divulgation des données.
        </p>
      </section>

      <section className="mt-6 space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-[#1b2653]">9. Cookies</h2>
        <p className="text-sm text-gray-800">
          Utilisation possible de cookies techniques nécessaires. Aucun cookie
          publicitaire ou de suivi avancé sans consentement. Vous pouvez
          paramétrer votre navigateur pour les refuser.
        </p>
      </section>

      <section className="mt-6 space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-[#1b2653]">10. Vos droits</h2>
        <p className="text-sm text-gray-800">
          Droits d’accès, rectification, effacement, limitation, opposition et
          portabilité. Pour exercer vos droits : {siteInfo.email}. Réponse sous
          30 jours.
        </p>
      </section>

      <section className="mt-6 space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-[#1b2653]">
          11. Réclamation
        </h2>
        <p className="text-sm text-gray-800">
          Si vos droits ne sont pas respectés, vous pouvez saisir la CNIL :{" "}
          <a className="underline" href="https://www.cnil.fr">
            https://www.cnil.fr
          </a>
          .
        </p>
      </section>

      <section className="mt-6 space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-[#1b2653]">
          12. Modification
        </h2>
        <p className="text-sm text-gray-800">
          Cette politique peut être mise à jour pour rester conforme à la
          législation. La version en ligne est la seule applicable.
        </p>
      </section>
    </main>
  );
}
