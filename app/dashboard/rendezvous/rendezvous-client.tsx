"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { rendezvousBaseSchema } from "@/lib/validations/rendezvous";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import { ConfirmModal } from "@/components/confirm-modal";
import { useRouter } from "next/navigation";

const adminFormSchema = rendezvousBaseSchema
  .extend({
    status: z.enum(["PENDING", "CONFIRMED"]),
  })
  .superRefine((value, ctx) => {
    try {
      // enforce date+time future
      const dt = new Date(`${value.date}T${value.time}`);
      if (Number.isNaN(dt.getTime())) {
        throw new Error("invalid");
      }
      if (dt.getTime() < Date.now()) {
        ctx.addIssue({
          code: "custom",
          path: ["date"],
          message: "La date doit être dans le futur",
        });
      }
    } catch {
      ctx.addIssue({
        code: "custom",
        path: ["date"],
        message: "Date ou heure invalide",
      });
    }
  });

type AdminForm = z.infer<typeof adminFormSchema>;

type RendezvousItem = {
  id: string;
  date: string;
  time: string;
  reason: string;
  content: string;
  status: "PENDING" | "CONFIRMED";
  userName: string;
  userEmail: string | null;
};

type Props = {
  rendezvous: RendezvousItem[];
};

export function RendezvousClient({ rendezvous }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items, setItems] = useState<RendezvousItem[]>(rendezvous);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const defaultValues: AdminForm = useMemo(
    () => ({
      date: "",
      time: "",
      reason: "",
      content: "",
      status: "PENDING",
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminForm>({
    resolver: zodResolver(adminFormSchema),
    defaultValues,
  });

  const selectRdv = (id: string) => {
    const rdv = items.find((r) => r.id === id);
    if (!rdv) return;
    setSelectedId(id);
    reset({
      date: rdv.date,
      time: rdv.time,
      reason: rdv.reason,
      content: rdv.content,
      status: rdv.status,
    });
    setMessage(null);
    setError(null);
  };

  const onSubmit = async (values: AdminForm) => {
    if (!selectedId) return;
    setMessage(null);
    setError(null);

    const res = await fetch(`/api/dashboard/rendezvous/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      setError("Échec de la mise à jour.");
      return;
    }
    const updated = (await res.json()) as {
      id: string;
      date: string;
      time: string;
      reason: string;
      content: string;
      status: "PENDING" | "CONFIRMED";
    };

    setItems((prev) =>
      prev
        .map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
        .sort((a, b) =>
          a.date === b.date
            ? a.time > b.time
              ? -1
              : 1
            : a.date > b.date
              ? -1
              : 1,
        ),
    );
    setMessage("Rendez-vous mis à jour.");
    router.refresh();
  };

  const confirmRdv = async (id: string) => {
    setConfirming(id);
    setError(null);
    setMessage(null);
    const res = await fetch(`/api/dashboard/rendezvous/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CONFIRMED" }),
    });
    setConfirming(null);
    if (!res.ok) {
      setError("Impossible de confirmer ce rendez-vous.");
      return;
    }
    const updated = (await res.json()) as RendezvousItem;
    setItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated } : r)),
    );
    setMessage("Rendez-vous confirmé.");
    router.refresh();
  };

  const deleteRdv = async () => {
    if (!confirmId) return;
    const id = confirmId;
    setConfirmId(null);
    const res = await fetch(`/api/dashboard/rendezvous/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("Suppression impossible.");
      return;
    }
    setItems((prev) => prev.filter((r) => r.id !== id));
    if (selectedId === id) {
      reset(defaultValues);
      setSelectedId(null);
    }
    setMessage("Rendez-vous supprimé.");
    router.refresh();
  };

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_1fr]">
      <Card className="border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Liste des rendez-vous
          </h2>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            {items.length} au total
          </span>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-gray-600">
            Aucun rendez-vous pour le moment.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((rdv) => (
              <li
                key={rdv.id}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm transition hover:border-gray-200 hover:bg-white"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      {rdv.userName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {rdv.userEmail ?? "—"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      rdv.status === "CONFIRMED"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {rdv.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-800">
                  <div className="font-semibold">
                    {rdv.date} — {rdv.time}
                  </div>
                  <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {rdv.reason}
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-700">{rdv.content}</p>
                <div className="mt-3 flex gap-2">
                  <ActionIconButton
                    action="view"
                    label="Éditer"
                    onClick={() => selectRdv(rdv.id)}
                    className="px-3 py-1.5 text-xs"
                  />
                  <ActionIconButton
                    action="edit"
                    label="Modifier"
                    tone="primary"
                    onClick={() => selectRdv(rdv.id)}
                    className="px-3 py-1.5 text-xs"
                  />
                  <ActionIconButton
                    action="delete"
                    label="Supprimer"
                    tone="danger"
                    onClick={() => setConfirmId(rdv.id)}
                    className="px-3 py-1.5 text-xs"
                  />
                  <Button
                    variant="secondary"
                    className="px-3 py-2 text-xs"
                    disabled={confirming === rdv.id}
                    onClick={() => confirmRdv(rdv.id)}
                  >
                    {confirming === rdv.id ? "Confirmation..." : "Confirmer"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            {selectedId ? "Modifier" : "Sélectionnez un rendez-vous"}
          </p>
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedId
              ? "Mettre à jour le rendez-vous"
              : "Choisissez un rendez-vous dans la liste"}
          </h2>
        </div>

        {selectedId ? (
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-800">
                  Date
                </label>
                <input
                  type="date"
                  {...register("date")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
                />
                {errors.date ? (
                  <p className="text-xs text-red-600">{errors.date.message}</p>
                ) : null}
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
                {errors.time ? (
                  <p className="text-xs text-red-600">{errors.time.message}</p>
                ) : null}
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
              {errors.reason ? (
                <p className="text-xs text-red-600">{errors.reason.message}</p>
              ) : null}
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
              {errors.content ? (
                <p className="text-xs text-red-600">{errors.content.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">
                Statut
              </label>
              <select
                {...register("status")}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
              </select>
            </div>

            {message ? (
              <p className="text-sm text-green-600">{message}</p>
            ) : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSelectedId(null);
                  reset(defaultValues);
                }}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Mettre à jour"}
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-gray-600">
            Sélectionnez une ligne pour modifier, confirmer ou supprimer un
            rendez-vous.
          </p>
        )}
      </Card>

      <ConfirmModal
        open={confirmId !== null}
        onCancel={() => setConfirmId(null)}
        onConfirm={deleteRdv}
        title="Supprimer le rendez-vous ?"
        description="Cette action est définitive."
        confirmLabel="Supprimer"
      />
    </div>
  );
}
