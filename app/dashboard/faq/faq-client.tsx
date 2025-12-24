"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { faqSchema, type FaqInput } from "@/lib/validations/faq";
import { ConfirmModal } from "@/components/confirm-modal";
import { ConfirmMessage } from "@/components/confirm-message";
import { useQueryClient } from "@tanstack/react-query";
import { Pagination } from "@/components/ui/pagination";
import { BackLink } from "@/components/back-link";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import { Button } from "@/components/ui/button";

type FaqItem = {
  id: number;
  question: string;
  answer: string;
  createdAt: string;
  categoryId: number;
};

type FaqClientProps = {
  initialFaqs: FaqItem[];
  categories: { id: number; name: string; order: number }[];
};

export default function FaqClient({ initialFaqs, categories }: FaqClientProps) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const pageSize = 5;

  const defaultValues = useMemo<FaqInput>(
    () => ({ question: "", answer: "", categoryId: categories[0]?.id }),
    [categories],
  );

  const { register, handleSubmit, reset, trigger, formState } =
    useForm<FaqInput>({
      resolver: zodResolver(faqSchema),
      defaultValues,
      mode: "onChange",
      reValidateMode: "onChange",
    });
  const { isSubmitting, isValid, errors } = formState;

  const fillForm = (faq: FaqItem) => {
    reset({
      question: faq.question,
      answer: faq.answer,
      categoryId: faq.categoryId,
    });
    trigger();
    setEditingId(faq.id);
  };

  const onSubmit = async (values: FaqInput) => {
    setMessage(null);
    setError(null);
    const url = editingId
      ? `/api/dashboard/faq/${editingId}`
      : "/api/dashboard/faq";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setError("Impossible d'enregistrer la FAQ.");
      return;
    }
    const saved: FaqItem = await res.json();
    setFaqs((prev) => {
      const others = prev.filter((f) => f.id !== saved.id);
      return [{ ...saved, createdAt: saved.createdAt }, ...others];
    });
    setPage(1);
    setMessage(editingId ? "FAQ mise à jour." : "FAQ ajoutée.");
    setEditingId(null);
    reset(defaultValues);
    trigger();
    queryClient.invalidateQueries({ queryKey: ["faq-preview"] });
  };

  const onDelete = async (id: number) => {
    setConfirmId(null);
    setMessage(null);
    setError(null);
    const res = await fetch(`/api/dashboard/faq/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Suppression impossible.");
      return;
    }
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    setPage(1);
    setMessage("FAQ supprimée.");
    if (editingId === id) {
      setEditingId(null);
      reset(defaultValues);
      trigger();
    }
    queryClient.invalidateQueries({ queryKey: ["faq-preview"] });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            FAQ
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            Questions & Réponses
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Ajoutez, mettez à jour ou supprimez les questions fréquentes
            affichées sur le site.
          </p>
        </div>
        <div className="flex gap-2">
          <BackLink className="hidden sm:inline-flex" />
          <ActionIconButton
            action="create"
            label="Nouvelle question"
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
              Liste des FAQ
            </h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              {faqs.length} au total
            </span>
          </div>
          {faqs.length === 0 ? (
            <p className="text-sm text-gray-600">
              Aucune question pour le moment.
            </p>
          ) : (
            <ul className="space-y-3">
              {faqs.slice((page - 1) * pageSize, page * pageSize).map((faq) => (
                <li
                  key={faq.id}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm transition hover:border-gray-200 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
                        <span>
                          {new Date(faq.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] text-gray-700">
                          {categories.find((c) => c.id === faq.categoryId)
                            ?.name || "FAQ"}
                        </span>
                      </div>
                      <p className="text-base font-semibold text-gray-900">
                        {faq.question}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <ActionIconButton
                        action="edit"
                        label="Modifier"
                        tone="primary"
                        onClick={() => fillForm(faq)}
                      />
                      <ActionIconButton
                        action="delete"
                        label="Supprimer"
                        tone="danger"
                        onClick={() => setConfirmId(faq.id)}
                      />
                    </div>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
                    {faq.answer}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4">
            <Pagination
              currentPage={page}
              pageSize={pageSize}
              totalCount={faqs.length}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              {editingId ? "Modifier" : "Nouvelle question"}
            </p>
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? "Mettre à jour la FAQ" : "Ajouter une question"}
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">
                Question
              </label>
              <textarea
                {...register("question")}
                rows={2}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
                placeholder="Quelle est la procédure ?"
              />
              {errors.question ? (
                <p className="text-xs text-red-600">
                  {errors.question.message}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">
                Réponse
              </label>
              <textarea
                {...register("answer")}
                rows={4}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
                placeholder="Expliquez clairement la réponse..."
              />
              {errors.answer ? (
                <p className="text-xs text-red-600">{errors.answer.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">
                Catégorie
              </label>
              <select
                {...register("categoryId", { valueAsNumber: true })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
                defaultValue={categories[0]?.id}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId ? (
                <p className="text-xs text-red-600">
                  {errors.categoryId.message}
                </p>
              ) : null}
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
        title="Supprimer la question ?"
        description="Cette action est définitive."
        confirmLabel="Supprimer"
      />
    </div>
  );
}
