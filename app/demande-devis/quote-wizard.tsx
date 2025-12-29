"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { ConfirmMessage } from "@/components/confirm-message";

type Offer = {
  id: string;
  title: string;
  shortDescription: string;
  priceLabel: string;
  includedOptionIds: string[];
};
export type QuoteWizardOption = {
  id: string;
  title: string;
  slug: string;
  pricingType: "FIXED" | "FROM" | "PER_UNIT" | "QUOTE_ONLY";
  priceCents: number | null;
  priceFromCents: number | null;
  unitLabel: string | null;
  unitPriceCents: number | null;
  durationDays?: number;
};

function formatOptionPrice(opt: QuoteWizardOption) {
  switch (opt.pricingType) {
    case "FIXED":
      return opt.priceCents != null
        ? `${(opt.priceCents / 100).toFixed(0)} €`
        : "Inclus";
    case "FROM":
      return opt.priceFromCents != null
        ? `À partir de ${(opt.priceFromCents / 100).toFixed(0)} €`
        : "À définir";
    case "PER_UNIT":
      if (opt.unitPriceCents != null && opt.unitLabel) {
        return `${(opt.unitPriceCents / 100).toFixed(0)} € / ${opt.unitLabel}`;
      }
      return "À définir";
    case "QUOTE_ONLY":
    default:
      return "Sur devis";
  }
}

type WizardProps = {
  initialUser: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  offers: Offer[];
  options: QuoteWizardOption[];
  isAuthenticated: boolean;
};

type Step = 0 | 1 | 2 | 3 | 4;

export default function QuoteWizard({
  initialUser,
  offers,
  options,
  isAuthenticated,
}: WizardProps) {
  const [step, setStep] = useState<Step>(0);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [general, setGeneral] = useState({
    projectDescription: "",
    desiredDeliveryDate: "",
  });
  const [selection, setSelection] = useState(() => ({
    serviceOfferId: offers[0]?.id || "",
    optionIds: offers[0]?.includedOptionIds ?? [],
  }));
  const [rdv, setRdv] = useState({
    date: "",
    time: "",
    reason: "Demande de devis",
    content: "",
  });
  const [contact, setContact] = useState({
    firstName: initialUser.firstName || "",
    lastName: initialUser.lastName || "",
    email: initialUser.email || "",
    phone: initialUser.phone || "",
  });

  const next = () => setStep((s) => Math.min(s + 1, 4) as Step);
  const prev = () => setStep((s) => Math.max(s - 1, 0) as Step);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      typeof window.scrollTo === "function" &&
      !(
        typeof navigator !== "undefined" &&
        navigator.userAgent?.includes("jsdom")
      )
    ) {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        // noop in non-browser environments (e.g., jsdom tests)
      }
    }
  }, [step]);

  const currentOffer = offers.find((o) => o.id === selection.serviceOfferId);
  const includedOptionIds = currentOffer?.includedOptionIds ?? [];
  const selectedOptionTitles = options
    .filter((opt) => selection.optionIds.includes(opt.id))
    .map((o) => o.title);
  const rdvDetailsPrefill = useMemo(() => {
    const parts = [];
    if (currentOffer?.title) parts.push(`Offre : ${currentOffer.title}`);
    if (selectedOptionTitles.length) {
      parts.push(`Options : ${selectedOptionTitles.join(", ")}`);
    }
    return parts.join(" | ");
  }, [currentOffer?.title, selectedOptionTitles]);
  const effectiveRdvContent = useMemo(
    () => (rdv.content?.trim() ? rdv.content.trim() : rdvDetailsPrefill.trim()),
    [rdv.content, rdvDetailsPrefill],
  );

  const toggleOption = (id: string) => {
    if (includedOptionIds.includes(id)) return;
    setSelection((prev) => ({
      ...prev,
      optionIds: prev.optionIds.includes(id)
        ? prev.optionIds.filter((opt) => opt !== id)
        : [...prev.optionIds, id],
    }));
  };

  const submit = async () => {
    setStatus(null);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...general,
          ...contact,
          serviceOfferId: selection.serviceOfferId || undefined,
          offerOptionIds: selection.optionIds,
          rendezvous:
            rdv.date && rdv.time
              ? { ...rdv, content: effectiveRdvContent || rdv.content }
              : undefined,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const message =
          typeof payload?.error === "string"
            ? payload.error
            : payload?.error?.message || "Impossible d'enregistrer le devis.";
        throw new Error(message);
      }
      setStatus({
        type: "success",
        message:
          "Votre demande de devis a été enregistrée et un email vous a été envoyé.",
      });
      setStep(0);
      setSubmitted(true);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Erreur lors de l'envoi du devis.",
      });
    }
  };

  const todayIso = new Date().toISOString().split("T")[0];

  const canSubmit = useMemo(() => {
    const hasProject = general.projectDescription.trim().length >= 10;
    const hasEmail = contact.email.trim().length > 0;
    const hasName =
      isAuthenticated ||
      (contact.firstName.trim().length > 0 &&
        contact.lastName.trim().length > 0);
    const hasPhone = isAuthenticated || contact.phone.trim().length > 0;
    return hasProject && hasEmail && hasName && hasPhone;
  }, [general.projectDescription, contact, isAuthenticated]);

  const stepIsValid = useMemo(() => {
    switch (step) {
      case 0:
        return general.projectDescription.trim().length >= 10;
      case 1:
        return Boolean(selection.serviceOfferId);
      case 2:
        return true;
      case 3: {
        const hasRdvField = rdv.date || rdv.time || rdv.reason || rdv.content;
        if (!hasRdvField) return true;
        if (!rdv.date || !rdv.time || !rdv.reason) return false;
        return effectiveRdvContent.length >= 10;
      }
      case 4:
        return canSubmit;
      default:
        return true;
    }
  }, [
    step,
    general.projectDescription,
    selection.serviceOfferId,
    rdv,
    canSubmit,
    effectiveRdvContent.length,
  ]);

  const stepTitles: Record<Step, { title: string; desc: string }> = {
    0: {
      title: "Informations générales",
      desc: "Décrivez brièvement votre projet et la date souhaitée.",
    },
    1: {
      title: "Choix du format",
      desc: "Sélectionnez l’offre qui correspond le mieux à votre besoin.",
    },
    2: {
      title: "Options complémentaires",
      desc: "Ajoutez les modules qui vous intéressent.",
    },
    3: {
      title: "Prise de rendez-vous",
      desc: "Proposez une date et une heure pour échanger.",
    },
    4: {
      title: "Contact et validation",
      desc: "Vérifiez vos coordonnées avant d’envoyer le devis.",
    },
  };

  return (
    <div className="bg-[#f7f9fc]">
      <Section>
        <SectionHeading
          eyebrow="Demande de devis"
          title="Un devis guidé en quelques étapes"
          description="Renseignez votre besoin, choisissez un format et des options, puis planifiez un rendez-vous."
        />

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          {submitted && status?.type === "success" ? (
            <div className="space-y-4">
              <ConfirmMessage
                type="success"
                message="Merci ! Votre demande de devis a bien été envoyée."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Button onClick={() => setStep(0)} variant="secondary">
                  Remplir un autre devis
                </Button>
                <Button
                  onClick={() => (window.location.href = "/realisations")}
                >
                  Voir les cas d&apos;usage
                </Button>
                <Button onClick={() => (window.location.href = "/methode")}>
                  Découvrir ma méthode
                </Button>
                {!isAuthenticated ? (
                  <Button onClick={() => signIn("google")}>
                    Se connecter pour un suivi rapide
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 flex w-full gap-1 text-[11px] sm:text-xs">
                {["Infos", "Format", "Options", "Rendez-vous", "Contact"].map(
                  (label, idx) => {
                    const isActive = step === idx;
                    return (
                      <div
                        key={label}
                        className={`flex-1 rounded-md px-2 py-1 text-center transition ${
                          isActive
                            ? "bg-[#3b5bff] text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {idx + 1}. {label}
                      </div>
                    );
                  },
                )}
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-[#1b2653]">
                  {stepTitles[step].title}
                </h3>
                <p className="text-sm text-gray-600">{stepTitles[step].desc}</p>
              </div>

              {step === 0 && (
                <div className="grid gap-4">
                  <textarea
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm"
                    placeholder="Décrivez brièvement votre projet"
                    value={general.projectDescription}
                    onChange={(e) =>
                      setGeneral((prev) => ({
                        ...prev,
                        projectDescription: e.target.value,
                      }))
                    }
                  />
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-800">
                      Date souhaitée de fin de réalisation
                    </label>
                    <input
                      type="date"
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm"
                      value={general.desiredDeliveryDate}
                      min={todayIso}
                      onChange={(e) =>
                        setGeneral((prev) => ({
                          ...prev,
                          desiredDeliveryDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-4">
                  {offers.map((offer) => (
                    <label
                      key={offer.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 ${
                        selection.serviceOfferId === offer.id
                          ? "border-[#3b5bff]"
                          : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="offer"
                        checked={selection.serviceOfferId === offer.id}
                        onChange={() =>
                          setSelection((prev) => {
                            const nextIncluded = offer.includedOptionIds ?? [];
                            const prevExtras = prev.optionIds.filter(
                              (id) => !nextIncluded.includes(id),
                            );
                            return {
                              serviceOfferId: offer.id,
                              optionIds: Array.from(
                                new Set([...nextIncluded, ...prevExtras]),
                              ),
                            };
                          })
                        }
                      />
                      <div>
                        <div className="font-semibold text-gray-900">
                          {offer.title}
                        </div>
                        <p className="text-sm text-gray-600">
                          {offer.shortDescription}
                        </p>
                        {offer.priceLabel ? (
                          <p className="mt-1 text-xs font-semibold text-[#1b2653]">
                            {offer.priceLabel}
                          </p>
                        ) : null}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-3">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-600">
                      Inclus dans l&apos;offre choisie
                    </p>
                    {includedOptionIds.length === 0 ? (
                      <p className="text-sm text-gray-600">
                        Aucune option incluse.
                      </p>
                    ) : (
                      <ul className="mt-2 grid gap-2 text-sm text-gray-800 sm:grid-cols-2">
                        {options
                          .filter((opt) => includedOptionIds.includes(opt.id))
                          .map((opt) => (
                            <li
                              key={opt.id}
                              className="flex items-start gap-2 rounded-lg bg-white px-3 py-2 text-sm text-[#1d4ed8]"
                            >
                              <span className="mt-0.5 h-2 w-2 rounded-full bg-[#1d4ed8]" />
                              <span className="text-xs sm:text-sm">
                                {opt.title}
                              </span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {options
                      .filter((opt) => !includedOptionIds.includes(opt.id))
                      .map((opt) => {
                        const priceLabel = formatOptionPrice(opt);
                        return (
                          <label
                            key={opt.id}
                            className="flex items-start gap-3 rounded-xl border border-gray-200 px-4 py-2"
                          >
                            <input
                              type="checkbox"
                              checked={selection.optionIds.includes(opt.id)}
                              onChange={() => toggleOption(opt.id)}
                            />
                            <div className="flex flex-col gap-1">
                              <span className="text-sm text-gray-900">
                                {opt.title}
                              </span>
                              <span className="text-xs text-gray-600">
                                {priceLabel}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-3">
                  <div className="flex gap-3">
                    <input
                      type="date"
                      className="w-1/2 rounded-xl border border-gray-200 px-4 py-2 text-sm"
                      value={rdv.date}
                      min={todayIso}
                      onChange={(e) =>
                        setRdv((prev) => ({ ...prev, date: e.target.value }))
                      }
                    />
                    <input
                      type="time"
                      className="w-1/2 rounded-xl border border-gray-200 px-4 py-2 text-sm"
                      value={rdv.time}
                      onChange={(e) =>
                        setRdv((prev) => ({ ...prev, time: e.target.value }))
                      }
                    />
                  </div>
                  <input
                    type="text"
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm"
                    placeholder="Objet du rendez-vous"
                    value={rdv.reason}
                    onChange={(e) =>
                      setRdv((prev) => ({ ...prev, reason: e.target.value }))
                    }
                  />
                  <textarea
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm"
                    placeholder="Détails"
                    value={rdv.content || rdvDetailsPrefill}
                    onChange={(e) =>
                      setRdv((prev) => ({ ...prev, content: e.target.value }))
                    }
                  />
                </div>
              )}

              {step === 4 && (
                <div className="grid gap-3">
                  {!isAuthenticated && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      Vous devez vous connecter pour finaliser.{" "}
                      <button
                        className="font-semibold text-[#3b5bff]"
                        onClick={() =>
                          signIn("google", { callbackUrl: "/demande-devis" })
                        }
                      >
                        Se connecter
                      </button>
                    </div>
                  )}
                  {!isAuthenticated && (
                    <>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          className="rounded-xl border border-gray-200 px-4 py-2 text-sm"
                          placeholder="Prénom"
                          value={contact.firstName}
                          onChange={(e) =>
                            setContact((p) => ({
                              ...p,
                              firstName: e.target.value,
                            }))
                          }
                        />
                        <input
                          className="rounded-xl border border-gray-200 px-4 py-2 text-sm"
                          placeholder="Nom"
                          value={contact.lastName}
                          onChange={(e) =>
                            setContact((p) => ({
                              ...p,
                              lastName: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <input
                        className="rounded-xl border border-gray-200 px-4 py-2 text-sm"
                        placeholder="Email"
                        value={contact.email}
                        onChange={(e) =>
                          setContact((p) => ({ ...p, email: e.target.value }))
                        }
                      />
                      <input
                        className="rounded-xl border border-gray-200 px-4 py-2 text-sm"
                        placeholder="Téléphone"
                        value={contact.phone}
                        onChange={(e) =>
                          setContact((p) => ({ ...p, phone: e.target.value }))
                        }
                      />
                    </>
                  )}
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="secondary"
                  type="button"
                  className="text-sm"
                  onClick={prev}
                  disabled={step === 0}
                >
                  ← Précédent
                </Button>
                {step < 4 ? (
                  <Button type="button" onClick={next} disabled={!stepIsValid}>
                    Étape suivante
                  </Button>
                ) : (
                  <SubmitButton
                    onClick={submit}
                    disabled={!canSubmit || !stepIsValid}
                  >
                    Envoyer le devis
                  </SubmitButton>
                )}
              </div>
              {status ? (
                <div className="mt-4">
                  <ConfirmMessage
                    type={status.type === "success" ? "success" : "error"}
                    message={status.message}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
      </Section>
    </div>
  );
}
