"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  serviceOfferSchema,
  type ServiceOfferInput,
} from "@/lib/validations/service-offer";
import { ConfirmMessage } from "@/components/confirm-message";
import { Button } from "@/components/ui/button";

type FormFeature = {
  id?: string;
  label: string;
  icon?: string | null;
  order?: number | null;
};
type FormStep = {
  id?: string;
  title: string;
  description: string;
  order?: number | null;
};
type FormUseCase = { id?: string; title: string; description: string };

type FormOffer =
  | (ServiceOfferInput & {
      id: string;
      features: FormFeature[];
      steps: FormStep[];
      useCases: FormUseCase[];
    })
  | null;

type Props = {
  mode: "create" | "edit";
  initialOffer?: FormOffer;
};

function parseLinesToFeatures(
  value: string,
): { label: string; icon?: string; order: number }[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, idx) => {
      const [label, icon] = line.split("|").map((s) => s.trim());
      return { label, icon: icon || undefined, order: idx };
    });
}

function parseLinesToSteps(
  value: string,
): { title: string; description: string; order: number }[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, idx) => {
      const [title, description] = line.split(":").map((s) => s.trim());
      return {
        title,
        description: description || title,
        order: idx,
      };
    });
}

function parseLinesToUseCases(
  value: string,
): { title: string; description: string }[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, description] = line.split(":").map((s) => s.trim());
      return { title, description: description || title };
    });
}

export function ServiceOfferForm({ mode, initialOffer }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const defaultValues = useMemo<ServiceOfferInput>(
    () => ({
      slug: initialOffer?.slug ?? "",
      title: initialOffer?.title ?? "",
      subtitle: initialOffer?.subtitle ?? "",
      shortDescription: initialOffer?.shortDescription ?? "",
      longDescription: initialOffer?.longDescription ?? "",
      targetAudience: initialOffer?.targetAudience ?? "",
      priceLabel: initialOffer?.priceLabel ?? "",
      durationLabel: initialOffer?.durationLabel ?? "",
      engagementLabel: initialOffer?.engagementLabel ?? "",
      isFeatured: initialOffer?.isFeatured ?? false,
      order: initialOffer?.order ?? 0,
      ctaLabel: initialOffer?.ctaLabel ?? "Demander un devis",
      ctaLink: initialOffer?.ctaLink ?? "/contact",
      features:
        initialOffer?.features?.map((f, idx) => ({
          label: f.label,
          icon: f.icon || undefined,
          order: f.order ?? idx,
        })) ?? [],
      steps:
        initialOffer?.steps?.map((s, idx) => ({
          title: s.title,
          description: s.description,
          order: s.order ?? idx,
        })) ?? [],
      useCases:
        initialOffer?.useCases?.map((u) => ({
          title: u.title,
          description: u.description,
        })) ?? [],
    }),
    [initialOffer],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ServiceOfferInput>({
    resolver: zodResolver(serviceOfferSchema),
    defaultValues,
    mode: "onChange",
  });

  const featuresText = watch("features")
    ?.map((f) => (f.icon ? `${f.label} | ${f.icon}` : f.label))
    .join("\n");
  const stepsText = watch("steps")
    ?.map((s) => `${s.title}: ${s.description}`)
    .join("\n");
  const useCasesText = watch("useCases")
    ?.map((u) => `${u.title}: ${u.description}`)
    .join("\n");

  const onSubmit = async (values: ServiceOfferInput) => {
    setMessage(null);
    setError(null);
    const method = mode === "edit" ? "PUT" : "POST";
    const url =
      mode === "edit" && initialOffer?.id
        ? `/api/dashboard/service-offers/${initialOffer.id}`
        : "/api/dashboard/service-offers";

    const payload = {
      ...values,
      features: values.features ?? [],
      steps: values.steps ?? [],
      useCases: values.useCases ?? [],
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("Impossible d'enregistrer l'offre.");
      return;
    }

    setMessage(
      mode === "edit" ? "Offre mise à jour." : "Offre créée avec succès.",
    );
    router.push("/dashboard/service-offers");
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
          {mode === "edit" ? "Modifier" : "Nouvelle offre"}
        </p>
        <h2 className="text-lg font-semibold text-gray-900">
          {mode === "edit" ? "Mettre à jour l'offre" : "Ajouter une offre"}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">Slug</label>
            <input
              {...register("slug")}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
              placeholder="site-vitrine-cle-en-main"
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
            placeholder="Site vitrine clé en main"
          />
          {errors.title ? (
            <p className="text-xs text-red-600">{errors.title.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800">
            Sous-titre
          </label>
          <input
            {...register("subtitle")}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
            placeholder="Un site professionnel, rapide et prêt à l'emploi"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800">
            Description courte
          </label>
          <textarea
            {...register("shortDescription")}
            rows={2}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
          />
          {errors.shortDescription ? (
            <p className="text-xs text-red-600">
              {errors.shortDescription.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800">
            Description détaillée
          </label>
          <textarea
            {...register("longDescription")}
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
          />
          {errors.longDescription ? (
            <p className="text-xs text-red-600">
              {errors.longDescription.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">
              Audience cible
            </label>
            <input
              {...register("targetAudience")}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
              placeholder="Écoles, associations, artisans, TPE"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">Prix</label>
            <input
              {...register("priceLabel")}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
              placeholder="À partir de ..."
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">Durée</label>
            <input
              {...register("durationLabel")}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
              placeholder="2 à 4 semaines"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">
              Engagement
            </label>
            <input
              {...register("engagementLabel")}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
              placeholder="Forfait, sans engagement"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("isFeatured")}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-sm font-semibold text-gray-800">
              Mettre en avant sur la landing
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">
              CTA lien
            </label>
            <input
              {...register("ctaLink")}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
              placeholder="/contact"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">
              CTA label
            </label>
            <input
              {...register("ctaLabel")}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
              placeholder="Demander un devis"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800">
            Points clés (un par ligne, format &quot;texte | emoji&quot;)
          </label>
          <textarea
            value={featuresText}
            onChange={(e) =>
              setValue("features", parseLinesToFeatures(e.target.value), {
                shouldDirty: true,
              })
            }
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800">
            Étapes (un par ligne, format &quot;Titre: Description&quot;)
          </label>
          <textarea
            value={stepsText}
            onChange={(e) =>
              setValue("steps", parseLinesToSteps(e.target.value), {
                shouldDirty: true,
              })
            }
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800">
            Cas d&apos;usage (un par ligne, format &quot;Titre:
            Description&quot;)
          </label>
          <textarea
            value={useCasesText}
            onChange={(e) =>
              setValue("useCases", parseLinesToUseCases(e.target.value), {
                shouldDirty: true,
              })
            }
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
          />
        </div>

        {message ? <ConfirmMessage type="success" message={message} /> : null}
        {error ? <ConfirmMessage type="error" message={error} /> : null}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/dashboard/service-offers")}
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
