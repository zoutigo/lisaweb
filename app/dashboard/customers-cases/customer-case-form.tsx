"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  customerCaseSchema,
  type CustomerCaseInput,
} from "@/lib/validations/customer-case";
import { ConfirmMessage } from "@/components/confirm-message";
import { Button } from "@/components/ui/button";
import { UploadImageInput } from "@/components/ui/upload-image-input";

type FormProps = {
  mode: "create" | "edit";
  initialCase?: (CustomerCaseInput & { id: string }) | null;
  availableResults?: { id: string; label: string; slug: string }[];
  availableFeatures?: { id: string; label: string; slug: string }[];
};

export function CustomerCaseForm({
  mode,
  initialCase,
  availableResults = [],
  availableFeatures = [],
}: FormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const resultInputRef = useRef<HTMLInputElement | null>(null);
  const featureInputRef = useRef<HTMLInputElement | null>(null);

  const defaultValues = useMemo(
    () => ({
      title: initialCase?.title ?? "",
      customer: initialCase?.customer ?? "",
      description: initialCase?.description ?? "",
      url: initialCase?.url ?? "",
      imageUrl: initialCase?.imageUrl ?? "",
      results: initialCase?.results ?? [],
      features: initialCase?.features ?? [],
      isActive: initialCase?.isActive ?? true,
      isFeatured: initialCase?.isFeatured ?? false,
    }),
    [initialCase],
  );

  const {
    register,
    handleSubmit,
    setValue,
    control,
    trigger,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<CustomerCaseInput>({
    resolver: zodResolver(customerCaseSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    void trigger();
  }, [trigger]);

  const selectedResults = useWatch({ control, name: "results" }) ?? [];
  const selectedFeatures = useWatch({ control, name: "features" }) ?? [];
  const imageValue = useWatch({ control, name: "imageUrl" }) || undefined;

  const addItem = (
    type: "results" | "features",
    label: string,
    current: { label: string; slug?: string }[],
  ) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const slug = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 80);
    if (current.some((r) => r.label === trimmed || r.slug === slug)) return;
    setValue(type, [...current, { label: trimmed, slug }], {
      shouldDirty: true,
    });
  };

  const onSubmit = async (values: CustomerCaseInput) => {
    setError(null);
    setMessage(null);
    const url =
      mode === "edit" && initialCase?.id
        ? `/api/dashboard/customer-cases/${initialCase.id}`
        : "/api/dashboard/customer-cases";
    const method = mode === "edit" ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setError("Impossible d'enregistrer le cas client.");
      return;
    }
    setMessage(
      mode === "edit"
        ? "Cas client mis à jour."
        : "Cas client créé avec succès.",
    );
    if (mode === "create") {
      reset(defaultValues);
    }
    router.push("/dashboard/customers-cases");
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
          {mode === "edit" ? "Modifier" : "Nouveau cas client"}
        </p>
        <h2 className="text-lg font-semibold text-gray-900">
          {mode === "edit"
            ? "Mettre à jour le cas client"
            : "Ajouter un cas client"}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800">
            Nom du client
          </label>
          <input
            {...register("customer")}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
            placeholder="Nom du client"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800">Titre</label>
          <input
            {...register("title")}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
            placeholder="Titre du cas client"
          />
          {errors.title ? (
            <p className="text-xs text-red-600">{errors.title.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
            placeholder="Décrivez le projet"
          />
          {errors.description ? (
            <p className="text-xs text-red-600">{errors.description.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800">
            URL (facultatif)
          </label>
          <input
            {...register("url")}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
            placeholder="https://exemple.com"
          />
          {errors.url ? (
            <p className="text-xs text-red-600">{errors.url.message}</p>
          ) : null}
        </div>
        <input type="hidden" {...register("imageUrl")} />
        <UploadImageInput
          label="Image (optionnelle)"
          value={imageValue}
          onChange={(url) =>
            setValue("imageUrl", url, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          onError={(msg) => (msg ? setError(msg) : setError(null))}
          helperText="Upload ou remplacez le visuel (stocké dans /files)."
        />
        {errors.imageUrl ? (
          <p className="text-xs text-red-600">{errors.imageUrl.message}</p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              Résultats (multi-sélection)
            </label>
            <select
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
              onChange={(e) => {
                const slug = e.target.value;
                const opt = availableResults.find((r) => r.slug === slug);
                if (opt) addItem("results", opt.label, selectedResults);
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Sélectionner un résultat
              </option>
              {availableResults.map((r) => (
                <option key={r.id} value={r.slug}>
                  {r.label}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              {selectedResults.map((r) => (
                <span
                  key={r.slug ?? r.label}
                  className="inline-flex items-center gap-2 rounded-full bg-[#f0f4ff] px-3 py-1 text-xs font-semibold text-[#1b2653]"
                >
                  {r.label}
                  <button
                    type="button"
                    className="text-[#3b5bff]"
                    onClick={() =>
                      setValue(
                        "results",
                        selectedResults.filter(
                          (it) => (it.slug ?? it.label) !== (r.slug ?? r.label),
                        ),
                        { shouldDirty: true },
                      )
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ajouter un nouveau résultat"
                ref={resultInputRef}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem(
                      "results",
                      (e.target as HTMLInputElement).value,
                      selectedResults,
                    );
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                data-testid="add-result-btn"
                onClick={() => {
                  const input = resultInputRef.current;
                  if (input) {
                    addItem("results", input.value, selectedResults);
                    input.value = "";
                  }
                }}
              >
                Ajouter
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              Caractéristiques (multi-sélection)
            </label>
            <select
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
              onChange={(e) => {
                const slug = e.target.value;
                const opt = availableFeatures.find((f) => f.slug === slug);
                if (opt) addItem("features", opt.label, selectedFeatures);
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Sélectionner une caractéristique
              </option>
              {availableFeatures.map((f) => (
                <option key={f.id} value={f.slug}>
                  {f.label}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              {selectedFeatures.map((f) => (
                <span
                  key={f.slug ?? f.label}
                  className="inline-flex items-center gap-2 rounded-full bg-[#f0f4ff] px-3 py-1 text-xs font-semibold text-[#1b2653]"
                >
                  {f.label}
                  <button
                    type="button"
                    className="text-[#3b5bff]"
                    onClick={() =>
                      setValue(
                        "features",
                        selectedFeatures.filter(
                          (it) => (it.slug ?? it.label) !== (f.slug ?? f.label),
                        ),
                        { shouldDirty: true },
                      )
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ajouter une caractéristique"
                ref={featureInputRef}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem(
                      "features",
                      (e.target as HTMLInputElement).value,
                      selectedFeatures,
                    );
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                data-testid="add-feature-btn"
                onClick={() => {
                  const input = featureInputRef.current;
                  if (input) {
                    addItem("features", input.value, selectedFeatures);
                    input.value = "";
                  }
                }}
              >
                Ajouter
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <input
              type="checkbox"
              {...register("isActive")}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-400"
            />
            Afficher sur la page Réalisations
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <input
              type="checkbox"
              {...register("isFeatured")}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-400"
            />
            Mettre en avant sur la landing (un seul cas client à la fois)
          </label>
        </div>

        {message ? <ConfirmMessage type="success" message={message} /> : null}
        {error ? <ConfirmMessage type="error" message={error} /> : null}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/dashboard/customers-cases")}
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
