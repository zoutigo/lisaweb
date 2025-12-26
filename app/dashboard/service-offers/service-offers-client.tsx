"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  serviceOfferSchema,
  type ServiceOfferInput,
} from "@/lib/validations/service-offer";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BackLink } from "@/components/back-link";
import { ConfirmModal } from "@/components/confirm-modal";
import { ConfirmMessage } from "@/components/confirm-message";

type Offer = ServiceOfferInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
  features: FormFeature[];
  steps: FormStep[];
  useCases: FormUseCase[];
};

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

type Props = {
  initialOffers: Offer[];
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

export default function ServiceOffersClient({ initialOffers }: Props) {
  const [offers, setOffers] = useState(initialOffers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const defaultValues = useMemo<ServiceOfferInput>(
    () => ({
      slug: "",
      title: "",
      subtitle: "",
      shortDescription: "",
      longDescription: "",
      targetAudience: "",
      priceLabel: "",
      durationLabel: "",
      engagementLabel: "",
      isFeatured: false,
      order: offers.length,
      ctaLabel: "Demander un devis",
      ctaLink: "/contact",
      features: [],
      steps: [],
      useCases: [],
    }),
    [offers.length],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch: watchForm,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceOfferInput>({
    resolver: zodResolver(serviceOfferSchema),
    defaultValues,
    mode: "onChange",
  });

  const fillForm = (offer: Offer) => {
    setEditingId(offer.id);
    reset({
      ...offer,
      subtitle: offer.subtitle ?? "",
      features: offer.features || [],
      steps: offer.steps || [],
      useCases: offer.useCases || [],
    });
    setValue(
      "features",
      offer.features?.map((f: FormFeature) => ({
        label: f.label,
        icon: f.icon || undefined,
        order: f.order ?? 0,
      })) ?? [],
    );
    setValue(
      "steps",
      offer.steps?.map((s: FormStep) => ({
        title: s.title,
        description: s.description,
        order: s.order ?? 0,
      })) ?? [],
    );
    setValue(
      "useCases",
      offer.useCases?.map((u: FormUseCase) => ({
        title: u.title,
        description: u.description,
      })) ?? [],
    );
  };

  const onSubmit = async (values: ServiceOfferInput) => {
    setMessage(null);
    setError(null);
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `/api/dashboard/service-offers/${editingId}`
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
      setError("Impossible d&apos;enregistrer l&apos;offre.");
      return;
    }
    const saved = await res.json();
    setOffers((prev) => {
      const others = prev.filter((o) => o.id !== saved.id);
      return [...others, saved].sort((a, b) => a.order - b.order);
    });
    setMessage(editingId ? "Offre mise à jour." : "Offre créée.");
    setEditingId(null);
    reset(defaultValues);
  };

  const onDelete = async (id: string) => {
    setConfirmId(null);
    setMessage(null);
    const res = await fetch(`/api/dashboard/service-offers/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("Suppression impossible.");
      return;
    }
    setOffers((prev) => prev.filter((o) => o.id !== id));
    if (editingId === id) {
      setEditingId(null);
      reset(defaultValues);
    }
    setMessage("Offre supprimée.");
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const featuresText = watchForm("features")
    ?.map((f) => (f.icon ? `${f.label} | ${f.icon}` : f.label))
    .join("\n");
  const stepsText = watchForm("steps")
    ?.map((s) => `${s.title}: ${s.description}`)
    .join("\n");
  const useCasesText = watchForm("useCases")
    ?.map((u) => `${u.title}: ${u.description}`)
    .join("\n");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Formats d&apos;accompagnement
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-600">
            Créez ou modifiez vos offres sans toucher au code.
          </p>
        </div>
        <div className="flex gap-2">
          <BackLink className="hidden sm:inline-flex" />
          <ActionIconButton
            action="create"
            label="Nouvelle offre"
            tone="primary"
            onClick={() => {
              setEditingId(null);
              reset(defaultValues);
            }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        <Card className="border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Liste des offres
            </h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              {offers.length} au total
            </span>
          </div>
          {offers.length === 0 ? (
            <p className="text-sm text-gray-600">
              Aucune offre pour le moment.
            </p>
          ) : (
            <ul className="space-y-3">
              {offers
                .sort((a, b) => a.order - b.order)
                .map((offer) => (
                  <li
                    key={offer.id}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm transition hover:border-gray-200 hover:bg-white"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          {offer.slug}
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {offer.title}
                        </p>
                        <p className="text-sm text-gray-700">
                          {offer.shortDescription}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-700">
                          <span className="rounded-full bg-white px-2 py-1 shadow">
                            {offer.targetAudience}
                          </span>
                          <span className="rounded-full bg-white px-2 py-1 shadow">
                            {offer.durationLabel}
                          </span>
                          <span className="rounded-full bg-white px-2 py-1 shadow">
                            {offer.priceLabel}
                          </span>
                          {offer.isFeatured ? (
                            <span className="rounded-full bg-green-100 px-2 py-1 font-semibold text-green-700">
                              Mis en avant
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <ActionIconButton
                          action="edit"
                          label="Modifier"
                          tone="primary"
                          onClick={() => fillForm(offer)}
                        />
                        <ActionIconButton
                          action="delete"
                          label="Supprimer"
                          tone="danger"
                          onClick={() => setConfirmId(offer.id)}
                        />
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </Card>

        <Card className="border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              {editingId ? "Modifier" : "Nouvelle offre"}
            </p>
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? "Mettre à jour l&apos;offre" : "Ajouter une offre"}
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-800">
                  Slug
                </label>
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
                <label className="text-sm font-semibold text-gray-800">
                  Ordre
                </label>
                <input
                  type="number"
                  {...register("order", { valueAsNumber: true })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">
                Titre
              </label>
              <input
                {...register("title")}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
                placeholder="Site vitrine clé en main"
              />
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
                <label className="text-sm font-semibold text-gray-800">
                  Prix
                </label>
                <input
                  {...register("priceLabel")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
                  placeholder="À partir de ..."
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-800">
                  Durée
                </label>
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

            {message ? (
              <ConfirmMessage type="success" message={message} />
            ) : null}
            {error ? <ConfirmMessage type="error" message={error} /> : null}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingId(null);
                  reset(defaultValues);
                }}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Enregistrement..."
                  : editingId
                    ? "Mettre à jour"
                    : "Ajouter"}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <ConfirmModal
        open={confirmId !== null}
        onCancel={() => setConfirmId(null)}
        onConfirm={() => confirmId && onDelete(confirmId)}
        title="Supprimer cette offre ?"
        description="Cette action est définitive."
        confirmLabel="Supprimer"
      />
    </div>
  );
}
