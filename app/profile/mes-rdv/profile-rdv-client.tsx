"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { rendezvousSchema } from "@/lib/validations/rendezvous";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/confirm-modal";
import { useRouter, useSearchParams } from "next/navigation";
import { ActionIconButton } from "@/components/ui/action-icon-button";

type RdvForm = z.infer<typeof rendezvousSchema>;

type ProfileRdvClientProps = {
  initialRendezvous: Array<{
    id: string;
    date: string;
    time: string;
    reason: string;
    content: string;
    status: string;
  }>;
};

const PENDING_RDV_KEY = "pending-rdv-profile";

export default function ProfileRdvClient({
  initialRendezvous,
}: ProfileRdvClientProps) {
  const [rdvs, setRdvs] = useState(initialRendezvous);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const defaultValues = useMemo<RdvForm>(
    () => ({
      date: "",
      time: "",
      reason: "",
      content: "",
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<RdvForm>({
    resolver: zodResolver(rendezvousSchema),
    defaultValues,
  });

  const initialMessage = useMemo(() => {
    const status = searchParams.get("rdv");
    if (!status) return null;
    return status === "updated"
      ? "Rendez-vous mis à jour."
      : "Rendez-vous enregistré.";
  }, [searchParams]);

  const [message, setMessage] = useState<string | null>(initialMessage);

  useEffect(() => {
    if (initialMessage && typeof window !== "undefined") {
      window.history.replaceState({}, "", "/profile/mes-rdv");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fillForm = (
    rdv: ProfileRdvClientProps["initialRendezvous"][number],
  ) => {
    reset({
      date: rdv.date,
      time: rdv.time,
      reason: rdv.reason,
      content: rdv.content,
    });
    setEditingId(rdv.id);
    setShowForm(true);
  };

  const onSubmit = async (values: RdvForm) => {
    setMessage(null);
    setError(null);
    if (message !== initialMessage) {
      setMessage(null);
    }
    const url = editingId
      ? `/api/profile/rendezvous/${editingId}`
      : "/api/profile/rendezvous";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      let message = "Impossible d'enregistrer le rendez-vous.";
      try {
        const data: { message?: string; error?: string } = await res.json();
        message = data?.message || data?.error || message;
        if (data?.error === "missing_phone") {
          sessionStorage.setItem(
            PENDING_RDV_KEY,
            JSON.stringify({ values, editingId }),
          );
          router.push("/profile/mes-rdv/completer");
          return;
        }
      } catch {
        // ignore JSON parsing errors
      }
      setError(message);
      return;
    }
    const saved = await res.json();
    setRdvs((prev) => {
      const others = prev.filter((r) => r.id !== saved.id);
      return [...others, { ...saved, content: saved.content }].sort((a, b) =>
        a.date === b.date
          ? a.time > b.time
            ? -1
            : 1
          : a.date > b.date
            ? -1
            : 1,
      );
    });
    setMessage(editingId ? "Rendez-vous mis à jour." : "Rendez-vous créé.");
    setEditingId(null);
    reset(defaultValues);
    setShowForm(false);
  };

  const onDelete = async (id: string) => {
    setConfirmId(null);
    const res = await fetch(`/api/profile/rendezvous/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("Suppression impossible.");
      return;
    }
    setRdvs((prev) => prev.filter((r) => r.id !== id));
    setMessage("Rendez-vous supprimé.");
    if (editingId === id) {
      setEditingId(null);
      reset(defaultValues);
      setShowForm(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Mes rendez-vous
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            Planifier et suivre
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Visualisez vos rendez-vous, modifiez les détails ou annulez en un
            clic.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="text-xs sm:text-sm"
            onClick={() => router.back()}
          >
            ← Retour
          </Button>
          <ActionIconButton
            action="create"
            label="Programmer un rendez-vous"
            tone="primary"
            onClick={() => {
              setEditingId(null);
              reset(defaultValues);
              setShowForm(true);
            }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Vos rendez-vous
            </h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              {rdvs.length} au total
            </span>
          </div>
          {rdvs.length === 0 ? (
            <p className="text-sm text-gray-600">
              Aucun rendez-vous encore. Planifiez-en un pour commencer.
            </p>
          ) : (
            <ul className="space-y-3">
              {rdvs.map((rdv) => (
                <li
                  key={rdv.id}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm transition hover:border-gray-200 hover:bg-white"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Date & heure
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {rdv.date} — {rdv.time}
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {rdv.status || "CONFIRMED"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {rdv.reason}
                  </p>
                  <p className="mt-1 text-sm text-gray-700">{rdv.content}</p>
                  <div className="mt-3 flex gap-2">
                    <ActionIconButton
                      action="edit"
                      label="Modifier"
                      onClick={() => fillForm(rdv)}
                    />
                    <ActionIconButton
                      action="delete"
                      label="Supprimer"
                      tone="danger"
                      onClick={() => setConfirmId(rdv.id)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                {editingId ? "Modifier" : "Nouveau"}
              </p>
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId
                  ? "Mettre à jour le rendez-vous"
                  : "Programmer un rendez-vous"}
              </h2>
            </div>
            {!showForm ? (
              <Button
                variant="secondary"
                className="text-xs"
                onClick={() => {
                  setShowForm(true);
                  setEditingId(null);
                  reset(defaultValues);
                }}
              >
                Ouvrir le formulaire
              </Button>
            ) : null}
          </div>
          {showForm ? (
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-800">
                    Date
                  </label>
                  <input
                    type="date"
                    {...register("date")}
                    min={minDate}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-800">
                    Heure
                  </label>
                  <input
                    type="time"
                    {...register("time")}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-800">
                  Raison
                </label>
                <input
                  {...register("reason")}
                  placeholder="Ex: Bilan de projet"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-800">
                  Détails
                </label>
                <textarea
                  {...register("content")}
                  rows={4}
                  placeholder="Ajoutez quelques précisions..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
                />
              </div>

              {message ? (
                <p className="text-sm text-green-600">{message}</p>
              ) : null}
              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="px-5"
                  onClick={() => {
                    setEditingId(null);
                    reset(defaultValues);
                    setShowForm(false);
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="px-6">
                  {isSubmitting
                    ? "Enregistrement..."
                    : editingId
                      ? "Mettre à jour"
                      : "Enregistrer"}
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-600">
              Cliquez sur « Programmer un rendez-vous » pour ouvrir le
              formulaire.
            </p>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmId !== null}
        onCancel={() => setConfirmId(null)}
        onConfirm={() => confirmId && onDelete(confirmId)}
        title="Supprimer le rendez-vous ?"
        description="Cette action est définitive."
        confirmLabel="Supprimer"
      />
    </div>
  );
}
