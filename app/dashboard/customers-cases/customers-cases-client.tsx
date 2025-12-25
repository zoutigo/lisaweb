"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import {
  customerCaseSchema,
  type CustomerCaseInput,
} from "@/lib/validations/customer-case";
import { ConfirmModal } from "@/components/confirm-modal";
import { ConfirmMessage } from "@/components/confirm-message";
import { useQueryClient } from "@tanstack/react-query";
import { Pagination } from "@/components/ui/pagination";
import { BackLink } from "@/components/back-link";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import { Button } from "@/components/ui/button";
import { UploadImageInput } from "@/components/ui/upload-image-input";

type CustomerCaseItem = CustomerCaseInput & {
  id: string;
  createdAt: string;
};

type Props = {
  initialCases: CustomerCaseItem[];
};

export default function CustomersCasesClient({ initialCases }: Props) {
  const [items, setItems] = useState<CustomerCaseItem[]>(initialCases);
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const pageSize = 5;

  const defaultValues = useMemo<CustomerCaseInput>(
    () => ({
      title: "",
      customer: "",
      description: "",
      url: "",
      result1: "",
      result2: "",
      result3: "",
      result4: "",
      result5: "",
      imageUrl: "",
      feature1: "",
      feature2: "",
      feature3: "",
      feature4: "",
      feature5: "",
    }),
    [],
  );

  const { register, handleSubmit, reset, trigger, formState, setValue, watch } =
    useForm<CustomerCaseInput>({
      resolver: zodResolver(customerCaseSchema),
      defaultValues,
      mode: "onChange",
      reValidateMode: "onChange",
    });
  const { isSubmitting, isValid, errors } = formState;

  const fillForm = (item: CustomerCaseItem) => {
    reset({
      title: item.title,
      customer: item.customer || "",
      description: item.description,
      url: item.url || "",
      imageUrl: item.imageUrl || "",
      result1: item.result1 || "",
      result2: item.result2 || "",
      result3: item.result3 || "",
      result4: item.result4 || "",
      result5: item.result5 || "",
      feature1: item.feature1 || "",
      feature2: item.feature2 || "",
      feature3: item.feature3 || "",
      feature4: item.feature4 || "",
      feature5: item.feature5 || "",
    });
    trigger();
    setEditingId(item.id);
  };

  const onSubmit = async (values: CustomerCaseInput) => {
    setMessage(null);
    setError(null);
    const url = editingId
      ? `/api/dashboard/customer-cases/${editingId}`
      : "/api/dashboard/customer-cases";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setError("Impossible d'enregistrer le cas client.");
      return;
    }
    const saved = (await res.json()) as CustomerCaseItem;
    setItems((prev) => {
      const others = prev.filter((f) => f.id !== saved.id);
      return [{ ...saved, createdAt: saved.createdAt }, ...others];
    });
    setPage(1);
    setMessage(editingId ? "Cas client mis à jour." : "Cas client ajouté.");
    setEditingId(null);
    reset(defaultValues);
    trigger();
    queryClient.invalidateQueries({ queryKey: ["landing-cases"] });
  };

  const onDelete = async (id: string) => {
    setConfirmId(null);
    setMessage(null);
    setError(null);
    const res = await fetch(`/api/dashboard/customer-cases/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("Suppression impossible.");
      return;
    }
    setItems((prev) => prev.filter((f) => f.id !== id));
    setPage(1);
    setMessage("Cas client supprimé.");
    if (editingId === id) {
      setEditingId(null);
      reset(defaultValues);
      trigger();
    }
    queryClient.invalidateQueries({ queryKey: ["landing-cases"] });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Cas clients
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            Gérez vos réalisations
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Ajoutez, mettez à jour ou supprimez les cas clients affichés sur la
            landing.
          </p>
        </div>
        <div className="flex gap-2">
          <BackLink className="hidden sm:inline-flex" />
          <ActionIconButton
            action="create"
            label="Nouveau cas client"
            tone="primary"
            onClick={() => {
              setEditingId(null);
              reset(defaultValues);
              trigger();
            }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Liste des cas clients
            </h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              {items.length} au total
            </span>
          </div>
          {items.length === 0 ? (
            <p className="text-sm text-gray-600">
              Aucun cas client pour le moment.
            </p>
          ) : (
            <ul className="space-y-3">
              {items
                .slice((page - 1) * pageSize, page * pageSize)
                .map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm transition hover:border-gray-200 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
                          <span>
                            {new Date(item.createdAt).toLocaleDateString(
                              "fr-FR",
                            )}
                          </span>
                        </div>
                        <p className="text-base font-semibold text-gray-900">
                          {item.title}
                        </p>
                        {item.customer ? (
                          <p className="text-sm text-gray-600">
                            {item.customer}
                          </p>
                        ) : null}
                        <p className="mt-1 text-sm text-gray-700">
                          {item.description}
                        </p>
                        {item.url ? (
                          <p className="text-sm text-blue-600 underline break-words">
                            {item.url}
                          </p>
                        ) : null}
                        {item.imageUrl ? (
                          <div className="relative mt-2 h-32 overflow-hidden rounded-lg border border-white/60 bg-white/70">
                            <Image
                              src={item.imageUrl}
                              alt={`Visuel pour ${item.title}`}
                              fill
                              sizes="100vw"
                              className="object-cover"
                            />
                          </div>
                        ) : null}
                        <div className="mt-2 grid gap-1 text-xs text-gray-700">
                          {[
                            item.result1,
                            item.result2,
                            item.result3,
                            item.result4,
                            item.result5,
                          ]
                            .filter(Boolean)
                            .map((res, idx) => (
                              <span
                                key={`${item.id}-res-${idx}`}
                                className="flex items-center gap-2"
                              >
                                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#3b5bff] text-[9px] font-bold text-white">
                                  ✓
                                </span>
                                {res}
                              </span>
                            ))}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#1b2653]">
                          {[
                            item.feature1,
                            item.feature2,
                            item.feature3,
                            item.feature4,
                            item.feature5,
                          ]
                            .filter(Boolean)
                            .map((feat, idx) => (
                              <span
                                key={`${item.id}-feat-${idx}`}
                                className="rounded-full bg-white px-2 py-1 shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
                              >
                                {feat}
                              </span>
                            ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <ActionIconButton
                          action="edit"
                          label="Modifier"
                          tone="primary"
                          onClick={() => fillForm(item)}
                        />
                        <ActionIconButton
                          action="delete"
                          label="Supprimer"
                          tone="danger"
                          onClick={() => setConfirmId(item.id)}
                        />
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          )}
          <div className="mt-4">
            <Pagination
              currentPage={page}
              pageSize={pageSize}
              totalCount={items.length}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              {editingId ? "Modifier" : "Nouveau cas client"}
            </p>
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId
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
              <label className="text-sm font-semibold text-gray-800">
                Titre
              </label>
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
                <p className="text-xs text-red-600">
                  {errors.description.message}
                </p>
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
              <Button type="submit" disabled={isSubmitting || !isValid}>
                {isSubmitting
                  ? "Enregistrement..."
                  : editingId
                    ? "Mettre à jour"
                    : "Ajouter"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        open={confirmId !== null}
        onCancel={() => setConfirmId(null)}
        onConfirm={() => confirmId && onDelete(confirmId)}
        title="Supprimer ce cas client ?"
        description="Cette action est définitive."
        confirmLabel="Supprimer"
      />
    </div>
  );
}
