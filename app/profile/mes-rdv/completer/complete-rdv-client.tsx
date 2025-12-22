"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { rendezvousSchema } from "@/lib/validations/rendezvous";
import { useRouter } from "next/navigation";

const frenchPhoneRegex = /^(\+33|0)[1-9](?:[ .-]?\d{2}){4}$/;

const completionSchema = z.object({
  firstName: z.string().min(1, "Prénom requis").max(100),
  lastName: z.string().min(1, "Nom requis").max(100),
  phone: z
    .string()
    .regex(frenchPhoneRegex, "Numéro de téléphone français invalide"),
  name: z.string().min(1).max(100).optional(),
});

type CompletionForm = z.infer<typeof completionSchema>;
type PendingRdv = {
  values: z.infer<typeof rendezvousSchema>;
  editingId: number | null;
};

const PENDING_RDV_KEY = "pending-rdv-profile";

type CompleteRdvClientProps = {
  initialUser: {
    name: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
};

export default function CompleteRdvClient({
  initialUser,
}: CompleteRdvClientProps) {
  const router = useRouter();
  const [pendingRdv, setPendingRdv] = useState<PendingRdv | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, isValid, errors },
  } = useForm<CompletionForm>({
    resolver: zodResolver(completionSchema),
    mode: "onChange",
    defaultValues: {
      firstName: initialUser.firstName,
      lastName: initialUser.lastName,
      phone: initialUser.phone,
      name: initialUser.name,
    },
  });

  useEffect(() => {
    setValue("firstName", initialUser.firstName);
    setValue("lastName", initialUser.lastName);
    setValue("phone", initialUser.phone);
    setValue("name", initialUser.name);
  }, [initialUser, setValue]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_RDV_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PendingRdv;
        setPendingRdv(parsed);
      } else {
        setError("Aucune demande de rendez-vous en attente.");
      }
    } catch {
      setError("Impossible de récupérer la demande en attente.");
    } finally {
      setLoaded(true);
    }
  }, []);

  const rdvSummary = useMemo(() => {
    if (!pendingRdv) return null;
    const { values } = pendingRdv;
    return (
      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-blue-700">
          Rendez-vous à valider
        </p>
        <div className="mt-2 grid gap-1">
          <span className="font-semibold">
            {values.date} — {values.time}
          </span>
          <span className="font-medium text-blue-800">{values.reason}</span>
          <span className="text-blue-900">{values.content}</span>
        </div>
        <p className="mt-3 text-xs text-blue-800">
          Nous devons d&apos;abord compléter vos informations de contact pour
          confirmer ce rendez-vous.
        </p>
      </div>
    );
  }, [pendingRdv]);

  const onSubmit = async (values: CompletionForm) => {
    setError(null);
    setMessage(null);

    if (!pendingRdv) {
      setError("Aucune demande de rendez-vous en attente.");
      return;
    }

    const computedName = (
      values.name || `${values.firstName} ${values.lastName}`
    ).trim();
    const profilePayload = {
      ...values,
      name: computedName || undefined,
    };

    const profileRes = await fetch("/api/profile/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profilePayload),
    });

    if (!profileRes.ok) {
      setError("Impossible de mettre à jour vos informations.");
      return;
    }

    setMessage("Profil mis à jour. Enregistrement du rendez-vous...");

    const rdvUrl = pendingRdv.editingId
      ? `/api/profile/rendezvous/${pendingRdv.editingId}`
      : "/api/profile/rendezvous";
    const rdvMethod = pendingRdv.editingId ? "PUT" : "POST";

    const rdvRes = await fetch(rdvUrl, {
      method: rdvMethod,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pendingRdv.values),
    });

    if (!rdvRes.ok) {
      setError(
        "Profil mis à jour, mais le rendez-vous n'a pas pu être enregistré.",
      );
      return;
    }

    sessionStorage.removeItem(PENDING_RDV_KEY);
    const status = pendingRdv.editingId ? "updated" : "created";
    router.replace(`/profile/mes-rdv?rdv=${status}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          Mon profil
        </p>
        <h1 className="text-2xl font-bold text-gray-900">
          Compléter mes informations
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Ajoutez vos informations de contact pour finaliser votre demande de
          rendez-vous.
        </p>
      </div>

      {rdvSummary}

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Profil
            </p>
            <h2 className="text-lg font-semibold text-gray-900">
              Coordonnées requises
            </h2>
          </div>
          <Button
            variant="secondary"
            className="text-xs"
            onClick={() => router.back()}
          >
            ← Retour
          </Button>
        </div>

        {loaded ? (
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-800">
                  Prénom
                </label>
                <input
                  {...register("firstName")}
                  placeholder="Prénom"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
                />
                {errors.firstName ? (
                  <p className="text-xs text-red-600">
                    {errors.firstName.message}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-800">
                  Nom
                </label>
                <input
                  {...register("lastName")}
                  placeholder="Nom"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
                />
                {errors.lastName ? (
                  <p className="text-xs text-red-600">
                    {errors.lastName.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">
                Téléphone
              </label>
              <input
                {...register("phone")}
                placeholder="+33 6 12 34 56 78"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
              />
              <p className="text-xs text-gray-500">
                Format attendu: numéro français (+33 ou 0, 10 chiffres).
              </p>
              {errors.phone ? (
                <p className="text-xs text-red-600">{errors.phone.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">
                Nom complet (optionnel)
              </label>
              <input
                {...register("name")}
                placeholder="Nom complet"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
              />
              {errors.name ? (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">
                Email
              </label>
              <input
                value={initialUser.email}
                disabled
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-700"
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
                onClick={() => router.back()}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="px-6"
              >
                {isSubmitting
                  ? "Enregistrement..."
                  : "Enregistrer et continuer"}
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-gray-600">Chargement en cours...</p>
        )}
      </div>
    </div>
  );
}
