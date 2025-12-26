"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
};

export function CustomerCaseForm({ mode, initialCase }: FormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const defaultValues = useMemo(
    () => ({
      title: initialCase?.title ?? "",
      customer: initialCase?.customer ?? "",
      description: initialCase?.description ?? "",
      url: initialCase?.url ?? "",
      imageUrl: initialCase?.imageUrl ?? "",
      result1: initialCase?.result1 ?? "",
      result2: initialCase?.result2 ?? "",
      result3: initialCase?.result3 ?? "",
      result4: initialCase?.result4 ?? "",
      result5: initialCase?.result5 ?? "",
      feature1: initialCase?.feature1 ?? "",
      feature2: initialCase?.feature2 ?? "",
      feature3: initialCase?.feature3 ?? "",
      feature4: initialCase?.feature4 ?? "",
      feature5: initialCase?.feature5 ?? "",
      isOnLandingPage: initialCase?.isOnLandingPage ?? false,
    }),
    [initialCase],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<CustomerCaseInput>({
    resolver: zodResolver(customerCaseSchema),
    defaultValues,
    mode: "onChange",
  });

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
        {(() => {
          // eslint-disable-next-line react-hooks/incompatible-library
          const imageValue = watch("imageUrl") || undefined;
          return (
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
          );
        })()}
        {errors.imageUrl ? (
          <p className="text-xs text-red-600">{errors.imageUrl.message}</p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={`result-${idx}`} className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">
                Résultat {idx} (optionnel)
              </label>
              <input
                {...register(`result${idx}` as keyof CustomerCaseInput)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
                placeholder="Ex: +30% de demandes"
              />
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={`feature-${idx}`} className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">
                Caractéristique {idx} (optionnel)
              </label>
              <input
                {...register(`feature${idx}` as keyof CustomerCaseInput)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
                placeholder="Ex: SEO local, Mobile first"
              />
            </div>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <input
            type="checkbox"
            {...register("isOnLandingPage")}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-400"
          />
          Mettre en avant sur la landing (un seul cas client à la fois)
        </label>

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
