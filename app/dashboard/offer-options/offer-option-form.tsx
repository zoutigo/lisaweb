"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  offerOptionSchema,
  type OfferOptionInput,
} from "@/lib/validations/offer-option";
import { ConfirmMessage } from "@/components/confirm-message";
import { Button } from "@/components/ui/button";
import { pricingTypeValues } from "@/lib/validations/offer-option";

type FormProps = {
  mode: "create" | "edit";
  initialOption?: (OfferOptionInput & { id: string }) | null;
};

export function OfferOptionForm({ mode, initialOption }: FormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<OfferOptionInput>({
    resolver: zodResolver(offerOptionSchema),
    defaultValues: {
      slug: initialOption?.slug ?? "",
      title: initialOption?.title ?? "",
      descriptionShort: initialOption?.descriptionShort ?? "",
      descriptionLong: initialOption?.descriptionLong ?? "",
      pricingType: initialOption?.pricingType ?? "QUOTE_ONLY",
      priceCents: initialOption?.priceCents ?? undefined,
      priceFromCents: initialOption?.priceFromCents ?? undefined,
      unitLabel: initialOption?.unitLabel ?? "",
      unitPriceCents: initialOption?.unitPriceCents ?? undefined,
      durationDays: initialOption?.durationDays ?? 2,
      isPopular: initialOption?.isPopular ?? false,
      order: initialOption?.order ?? 0,
      constraintsJson: initialOption?.constraintsJson ?? "",
    },
    mode: "onChange",
  });

  const pricingType = useWatch({ control, name: "pricingType" });

  const onSubmit = async (values: OfferOptionInput) => {
    setError(null);
    setMessage(null);
    const url =
      mode === "edit" && initialOption?.id
        ? `/api/dashboard/offer-options/${initialOption.id}`
        : "/api/dashboard/offer-options";
    const method = mode === "edit" ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setError("Impossible d'enregistrer l'option.");
      return;
    }
    setMessage(
      mode === "edit" ? "Option mise à jour." : "Option créée avec succès.",
    );
    router.push("/dashboard/offer-options");
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
          {mode === "edit" ? "Modifier" : "Nouvelle option"}
        </p>
        <h2 className="text-lg font-semibold text-gray-900">
          {mode === "edit"
            ? "Mettre à jour l'option"
            : "Ajouter une option d'offre"}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">Slug</label>
            <input
              {...register("slug")}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
              placeholder="boutique-en-ligne"
            />
            {errors.slug ? (
              <p className="text-xs text-red-600">{errors.slug.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">Ordre</label>
            <input
              type="number"
              {...register("order", { valueAsNumber: true })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800">Titre</label>
          <input
            {...register("title")}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
            placeholder="Boutique en ligne"
          />
          {errors.title ? (
            <p className="text-xs text-red-600">{errors.title.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800">
            Description courte
          </label>
          <textarea
            {...register("descriptionShort")}
            rows={2}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
          />
          {errors.descriptionShort ? (
            <p className="text-xs text-red-600">
              {errors.descriptionShort.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800">
            Description détaillée
          </label>
          <textarea
            {...register("descriptionLong")}
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
          />
          {errors.descriptionLong ? (
            <p className="text-xs text-red-600">
              {errors.descriptionLong.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">
              Type de prix
            </label>
            <select
              {...register("pricingType")}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
            >
              {pricingTypeValues.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("isPopular")}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-sm font-semibold text-gray-800">
              Populaire
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">
              Durée (jours)
            </label>
            <input
              type="number"
              {...register("durationDays", { valueAsNumber: true })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
              placeholder="2"
            />
            {errors.durationDays ? (
              <p className="text-xs text-red-600">
                {errors.durationDays.message}
              </p>
            ) : null}
          </div>
          <div />
        </div>

        {pricingType === "FIXED" ? (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">
              Prix (cents)
            </label>
            <input
              type="number"
              {...register("priceCents", { valueAsNumber: true })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
            />
            {errors.priceCents ? (
              <p className="text-xs text-red-600">
                {errors.priceCents.message}
              </p>
            ) : null}
          </div>
        ) : null}

        {pricingType === "FROM" ? (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">
              Prix à partir de (cents)
            </label>
            <input
              type="number"
              {...register("priceFromCents", { valueAsNumber: true })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
            />
            {errors.priceFromCents ? (
              <p className="text-xs text-red-600">
                {errors.priceFromCents.message}
              </p>
            ) : null}
          </div>
        ) : null}

        {pricingType === "PER_UNIT" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">
                Libellé unité
              </label>
              <input
                {...register("unitLabel")}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
                placeholder="produit, page, langue..."
              />
              {errors.unitLabel ? (
                <p className="text-xs text-red-600">
                  {errors.unitLabel.message}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">
                Prix par unité (cents)
              </label>
              <input
                type="number"
                {...register("unitPriceCents", { valueAsNumber: true })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
              />
              {errors.unitPriceCents ? (
                <p className="text-xs text-red-600">
                  {errors.unitPriceCents.message}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800">
            Contraintes (JSON)
          </label>
          <textarea
            {...register("constraintsJson")}
            rows={2}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
            placeholder='Ex: {"dependsOn":["seo"],"incompatible":["blog"]}'
          />
          {errors.constraintsJson ? (
            <p className="text-xs text-red-600">
              {errors.constraintsJson.message}
            </p>
          ) : null}
        </div>

        {message ? <ConfirmMessage type="success" message={message} /> : null}
        {error ? <ConfirmMessage type="error" message={error} /> : null}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/dashboard/offer-options")}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting || !isValid}>
            {isSubmitting
              ? "Enregistrement..."
              : mode === "edit"
                ? "Mettre à jour"
                : "Ajouter"}
          </Button>
        </div>
      </form>
    </div>
  );
}
