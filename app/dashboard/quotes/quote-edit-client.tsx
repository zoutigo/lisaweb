"use client";

import { useEffect, useState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { ConfirmMessage } from "@/components/confirm-message";

type SelectOption = {
  id: string;
  title: string;
  priceLabel?: string | null;
  durationDays?: number;
  includedOptionIds?: string[];
};

type QuoteOption = {
  id: string;
  title: string;
  pricingType: "FIXED" | "FROM" | "PER_UNIT" | "QUOTE_ONLY";
  priceCents: number | null;
  priceFromCents: number | null;
  unitLabel: string | null;
  unitPriceCents: number | null;
  durationDays?: number;
};

export function QuoteEditClient({
  quote,
  offers,
  options,
}: {
  quote: {
    id: string;
    projectDescription: string;
    serviceOfferId: string | null;
    options: (QuoteOption & { quantity?: number })[];
    status: "NEW" | "SENT" | "REVIEWED";
  };
  offers: SelectOption[];
  options: QuoteOption[];
}) {
  const [projectDescription, setProjectDescription] = useState(
    quote.projectDescription,
  );
  const [serviceOfferId, setServiceOfferId] = useState(
    quote.serviceOfferId || "",
  );
  const [offerOptionIds, setOfferOptionIds] = useState<string[]>(
    quote.options.map((o) => o.id),
  );
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [quoteStatus, setQuoteStatus] = useState<"NEW" | "SENT" | "REVIEWED">(
    quote.status,
  );
  const [loading, setLoading] = useState(false);
  const [optionQuantities, setOptionQuantities] = useState<
    Record<string, number>
  >(() => {
    const base: Record<string, number> = {};
    options.forEach((o) => {
      const existing = quote.options.find((qo) => qo.id === o.id)?.quantity;
      base[o.id] = existing && existing > 0 ? existing : 0;
    });
    return base;
  });

  const isMonthly = (opt: QuoteOption) =>
    Boolean(opt.unitLabel && opt.unitLabel.toLowerCase().includes("mois"));

  const includedOptionIds =
    offers.find((o) => o.id === serviceOfferId)?.includedOptionIds ?? [];

  // Ensure included options stay selected with quantity 1 by default
  useEffect(() => {
    if (!includedOptionIds.length) return;
    setOfferOptionIds((prev) =>
      Array.from(new Set([...prev, ...includedOptionIds])),
    );
    setOptionQuantities((prev) => {
      const next = { ...prev };
      includedOptionIds.forEach((id) => {
        next[id] = Math.max(1, next[id] ?? 1);
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceOfferId]);

  const totals = offerOptionIds.reduce(
    (acc, id) => {
      const opt = options.find((o) => o.id === id);
      if (!opt) return acc;
      const qty = Math.max(1, optionQuantities[id] ?? 1);
      const val =
        opt.pricingType === "FIXED"
          ? (opt.priceCents ?? 0) * qty
          : opt.pricingType === "FROM"
            ? (opt.priceFromCents ?? 0) * qty
            : opt.pricingType === "PER_UNIT"
              ? (opt.unitPriceCents ?? 0) * qty
              : 0;
      if (isMonthly(opt)) acc.monthly += val;
      else acc.oneTime += val;
      return acc;
    },
    { oneTime: 0, monthly: 0 },
  );

  const includedOptions = options.filter((o) =>
    includedOptionIds.includes(o.id),
  );
  const extraOptions = options.filter((o) => !includedOptionIds.includes(o.id));
  const durationFromOptions = offerOptionIds.reduce((acc, id) => {
    const opt = options.find((o) => o.id === id);
    if (!opt) return acc;
    const qty = Math.max(1, optionQuantities[id] ?? 1);
    return acc + (opt.durationDays ?? 0) * qty;
  }, 0);
  const baseDuration =
    offers.find((o) => o.id === serviceOfferId)?.durationDays ?? 0;
  const totalDuration = baseDuration + durationFromOptions;

  const toggleOption = (id: string) => {
    if (includedOptionIds.includes(id)) return;
    setOfferOptionIds((prev) => {
      if (prev.includes(id)) {
        setOptionQuantities((q) => ({ ...q, [id]: 0 }));
        return prev.filter((opt) => opt !== id);
      }
      setOptionQuantities((q) => ({ ...q, [id]: Math.max(1, q[id] || 1) }));
      return [...prev, id];
    });
  };
  const adjustQuantity = (id: string, delta: number) => {
    setOptionQuantities((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      const updated = { ...prev, [id]: next };
      setOfferOptionIds((ids) => {
        if (next <= 0) return ids.filter((optId) => optId !== id);
        if (!ids.includes(id)) return [...ids, id];
        return ids;
      });
      return updated;
    });
  };

  const formatPrice = (opt: QuoteOption) => {
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
      default:
        return "Sur devis";
    }
  };

  const submit = async () => {
    setStatusMessage(null);
    setLoading(true);
    const res = await fetch(`/api/dashboard/quotes/${quote.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectDescription,
        serviceOfferId: serviceOfferId || null,
        offerOptions: offerOptionIds.map((id) => ({
          id,
          quantity: Math.max(1, optionQuantities[id] ?? 1),
        })),
        status: quoteStatus,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setStatusMessage({
        type: "error",
        message:
          payload?.error || "Impossible de mettre à jour la demande de devis.",
      });
      return;
    }
    setStatusMessage({
      type: "success",
      message: "Devis mis à jour.",
    });
  };

  return (
    <div className="mt-6 space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <label
          className="text-sm font-semibold text-gray-700"
          htmlFor="quote-status"
        >
          Statut
        </label>
        <select
          id="quote-status"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          value={quoteStatus}
          onChange={(e) =>
            setQuoteStatus(e.target.value as "NEW" | "SENT" | "REVIEWED")
          }
        >
          <option value="NEW">Nouveau</option>
          <option value="SENT">Envoyé</option>
          <option value="REVIEWED">Revérifié</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">
          Description du projet
        </label>
        <textarea
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
          rows={4}
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          placeholder="Décrivez le besoin du client"
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-semibold text-gray-700"
          htmlFor="quote-format"
        >
          Format choisi
        </label>
        <select
          id="quote-format"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          value={serviceOfferId}
          onChange={(e) => setServiceOfferId(e.target.value)}
        >
          <option value="">Aucun</option>
          {offers.map((offer) => (
            <option key={offer.id} value={offer.id}>
              {offer.title} {offer.priceLabel ? `- ${offer.priceLabel}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-600">
          Options incluses dans le format
        </p>
        {includedOptions.length ? (
          <ul className="mt-2 space-y-2 text-sm text-gray-800">
            {includedOptions.map((opt) => (
              <li
                key={opt.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2"
              >
                <span>{opt.title}</span>
                <span className="text-xs font-semibold text-green-700">
                  Inclus
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-gray-600">Aucune option incluse.</p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">
          Options supplémentaires
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {extraOptions.map((opt) => (
            <label
              key={opt.id}
              className="flex items-start gap-3 rounded-xl border border-gray-200 px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={(optionQuantities[opt.id] ?? 0) > 0}
                onChange={() => toggleOption(opt.id)}
              />
              <div className="flex flex-col gap-1">
                <span className="text-gray-900">{opt.title}</span>
                <span className="text-xs text-gray-600">
                  {formatPrice(opt)}
                </span>
                {includedOptionIds.includes(opt.id) && (
                  <span className="text-[11px] font-semibold text-green-700">
                    Inclus dans le format
                  </span>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <span>Quantité</span>
                  <button
                    type="button"
                    className="h-6 w-6 rounded-full border border-gray-200"
                    onClick={() => adjustQuantity(opt.id, -1)}
                    disabled={includedOptionIds.includes(opt.id)}
                  >
                    −
                  </button>
                  <span>{optionQuantities[opt.id] ?? 0}</span>
                  <button
                    type="button"
                    className="h-6 w-6 rounded-full border border-gray-200"
                    onClick={() => adjustQuantity(opt.id, 1)}
                    disabled={includedOptionIds.includes(opt.id)}
                  >
                    +
                  </button>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-600">
          Synthèse des prix
        </p>
        <div className="mt-2 space-y-2 text-sm text-gray-800">
          <div className="flex items-center justify-between">
            <span>Format</span>
            <span>
              {offers.find((o) => o.id === serviceOfferId)?.priceLabel ||
                "Sur devis"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Options ponctuelles</span>
            <span>
              {totals.oneTime > 0
                ? `${(totals.oneTime / 100).toFixed(0)} €`
                : "À définir"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Options mensuelles</span>
            <span>
              {totals.monthly > 0
                ? `${(totals.monthly / 100).toFixed(0)} €/mois`
                : "Aucune"}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-600">
          Synthèse des délais
        </p>
        <div className="mt-2 space-y-2 text-sm text-gray-800">
          <div className="flex items-center justify-between">
            <span>Format</span>
            <span>{baseDuration > 0 ? `${baseDuration} j` : "À définir"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Options</span>
            <span>
              {durationFromOptions > 0
                ? `${durationFromOptions} j`
                : "Inclus/Aucun"}
            </span>
          </div>
          <div className="flex items-center justify-between font-semibold">
            <span>Total estimé</span>
            <span>
              {totalDuration > 0 ? `${totalDuration} j` : "À définir"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SubmitButton
          onClick={submit}
          disabled={!projectDescription.trim()}
          isSubmitting={loading}
          loadingLabel="Mise à jour..."
        >
          Mettre à jour
        </SubmitButton>
      </div>

      {statusMessage ? (
        <ConfirmMessage
          type={statusMessage.type === "success" ? "success" : "error"}
          message={statusMessage.message}
        />
      ) : null}
    </div>
  );
}
