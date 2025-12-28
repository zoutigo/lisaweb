"use client";

import { useState } from "react";
import { ConfirmMessage } from "@/components/confirm-message";
import { SubmitButton } from "@/components/ui/submit-button";
import type { QuoteStatus } from "@prisma/client";
import { ActionIconButton } from "@/components/ui/action-icon-button";

type QuoteDetailProps = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  projectDescription: string;
  desiredDeliveryDate?: string | null;
  serviceOfferTitle?: string | null;
  serviceOfferPriceLabel?: string | null;
  serviceOfferOptions: QuoteOption[];
  offerOptions: QuoteOption[];
  status: QuoteStatus;
  createdAt: string;
  rendezvous?: {
    scheduledAt: string;
    reason: string;
    details: string;
    id?: string;
  } | null;
};

type QuoteOption = {
  id: string;
  title: string;
  pricingType: "FIXED" | "FROM" | "PER_UNIT" | "QUOTE_ONLY";
  priceCents: number | null;
  priceFromCents: number | null;
  unitLabel: string | null;
  unitPriceCents: number | null;
  quantity?: number;
};

const statusLabels: Record<QuoteStatus, string> = {
  NEW: "Nouveau",
  SENT: "Envoyé",
  REVIEWED: "Revérifié",
};

export function QuoteDetailClient({ quote }: { quote: QuoteDetailProps }) {
  const [status, setStatus] = useState<QuoteStatus>(quote.status);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const includedOptionIds = new Set(
    quote.serviceOfferOptions?.map((o) => o.id) ?? [],
  );
  const includedOptions = (quote.serviceOfferOptions ?? []).map((o) => ({
    ...o,
    priceLabel: "Inclus dans le format",
  }));
  const extraOptions = quote.offerOptions
    .filter((o) => !includedOptionIds.has(o.id))
    .map((o) => ({ ...o, priceLabel: formatPrice(o) }));

  const optionPriceValue = (opt: QuoteOption): number | null => {
    const qty = opt.quantity ?? 1;
    if (opt.pricingType === "FIXED" && opt.priceCents != null)
      return opt.priceCents * qty;
    if (opt.pricingType === "FROM" && opt.priceFromCents != null)
      return opt.priceFromCents * qty;
    if (opt.pricingType === "PER_UNIT" && opt.unitPriceCents != null)
      return opt.unitPriceCents * qty;
    return null;
  };
  const isMonthly = (opt: QuoteOption) =>
    Boolean(opt.unitLabel && opt.unitLabel.toLowerCase().includes("mois"));

  const totals = extraOptions.reduce(
    (acc, opt) => {
      const val = optionPriceValue(opt);
      if (val == null) return acc;
      if (isMonthly(opt)) acc.monthly += val;
      else acc.oneTime += val;
      return acc;
    },
    { oneTime: 0, monthly: 0 },
  );

  const totalOneTimeLabel =
    totals.oneTime > 0 ? `${(totals.oneTime / 100).toFixed(0)} €` : "À définir";
  const totalMonthlyLabel =
    totals.monthly > 0
      ? `${(totals.monthly / 100).toFixed(0)} €/mois`
      : "Aucun";

  const save = async () => {
    setMessage(null);
    setError(null);
    setLoading(true);
    const res = await fetch(`/api/dashboard/quotes/${quote.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Impossible de mettre à jour le statut.");
      return;
    }
    setMessage("Statut mis à jour.");
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-gray-500">
            Client
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {[quote.firstName, quote.lastName].filter(Boolean).join(" ") ||
              "Contact"}
          </p>
          <p className="text-sm text-gray-700">{quote.email}</p>
          <p className="text-sm text-gray-700">{quote.phone || "—"}</p>
          <p className="text-xs text-gray-500">
            Créé le {new Date(quote.createdAt).toLocaleDateString("fr-FR")}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-600">
            Statut du devis
          </label>
          <select
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as QuoteStatus)}
          >
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <SubmitButton onClick={save} disabled={loading}>
            Enregistrer
          </SubmitButton>
        </div>
      </div>

      <div className="flex justify-end">
        <ActionIconButton
          action="edit"
          label="Modifier"
          as="link"
          href={`/dashboard/quotes/${quote.id}/edit`}
          tone="primary"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
        <p className="text-xs uppercase tracking-[0.12em] text-gray-500">
          Projet
        </p>
        <p className="text-sm text-gray-800 whitespace-pre-wrap">
          {quote.projectDescription}
        </p>
        {quote.desiredDeliveryDate ? (
          <p className="text-xs text-gray-600">
            Date souhaitée :{" "}
            {new Date(quote.desiredDeliveryDate).toLocaleDateString("fr-FR")}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-gray-500">
            Format choisi
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {quote.serviceOfferTitle || "Non précisé"}
          </p>
          {quote.serviceOfferPriceLabel ? (
            <p className="text-sm text-blue-700">
              {quote.serviceOfferPriceLabel}
            </p>
          ) : null}
          <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
            <p className="text-xs font-semibold text-gray-600">
              Options incluses
            </p>
            {includedOptions.length ? (
              <ul className="mt-2 space-y-1 text-sm text-gray-800">
                {includedOptions.map((o) => (
                  <li key={o.id} className="flex justify-between gap-2">
                    <span>{o.title}</span>
                    <span className="text-xs text-green-700">Inclus</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">Aucune option incluse.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-gray-500">
            Options ajoutées
          </p>
          {extraOptions.length ? (
            <ul className="space-y-2 text-sm text-gray-800">
              {extraOptions.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2"
                >
                  <span>
                    {o.title}
                    {o.quantity && o.quantity > 1 ? ` x${o.quantity}` : ""}
                  </span>
                  <span className="text-xs text-gray-700">{o.priceLabel}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">Aucune option ajoutée.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
        <p className="text-xs uppercase tracking-[0.12em] text-gray-500">
          Synthèse des prix
        </p>
        <div className="flex items-center justify-between text-sm text-gray-800">
          <span>Format</span>
          <span>{quote.serviceOfferPriceLabel || "Sur devis"}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-800">
          <span>Options ponctuelles</span>
          <span>{totalOneTimeLabel}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-800">
          <span>Options mensuelles</span>
          <span>{totalMonthlyLabel}</span>
        </div>
        <p className="text-xs text-gray-500">
          Estimation indicative. Les tarifs définitifs seront confirmés lors de
          l&apos;échange.
        </p>
      </div>
      <div className="flex justify-end">
        <ActionIconButton
          action="edit"
          label="Modifier"
          as="link"
          href={`/dashboard/quotes/${quote.id}/edit`}
        />
      </div>

      {quote.rendezvous ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-gray-500">
            Rendez-vous
          </p>
          <p className="text-sm text-gray-800">
            {new Date(quote.rendezvous.scheduledAt).toLocaleString("fr-FR", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <p className="text-sm text-gray-800">{quote.rendezvous.reason}</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {quote.rendezvous.details}
          </p>
          <div className="pt-2">
            <ActionIconButton
              action="edit"
              label="Modifier le rendez-vous"
              as="link"
              href={`/dashboard/rendezvous/${quote.rendezvous.id}/edit`}
              tone="primary"
            />
          </div>
        </div>
      ) : null}

      {message ? <ConfirmMessage type="success" message={message} /> : null}
      {error ? <ConfirmMessage type="error" message={error} /> : null}
    </div>
  );
}
