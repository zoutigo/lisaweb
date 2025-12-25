"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { userSelfUpdateSchema } from "@/lib/validations/user";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof userSelfUpdateSchema>;

type ProfileInfosClientProps = {
  initialUser: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    isAdmin: boolean;
  };
};

export default function ProfileInfosClient({
  initialUser,
}: ProfileInfosClientProps) {
  const [user, setUser] = useState(initialUser);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(userSelfUpdateSchema),
    defaultValues: {
      name: initialUser.name,
      firstName: initialUser.firstName,
      lastName: initialUser.lastName,
      phone: initialUser.phone,
    },
  });

  const onSubmit = async (values: FormData) => {
    setMessage(null);
    setError(null);
    const res = await fetch("/api/profile/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setError("Impossible d'enregistrer vos informations.");
      return;
    }
    const updated = await res.json();
    setUser({
      ...user,
      ...updated,
    });
    setMessage("Informations mises à jour.");
    reset({
      name: updated.name || "",
      firstName: updated.firstName || "",
      lastName: updated.lastName || "",
      phone: updated.phone || "",
    });
    setTimeout(() => {
      setShowForm(false);
      setMessage(null);
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Mon profil
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Mes informations</h1>
          <p className="mt-1 text-sm text-gray-600">
            Consultez vos informations personnelles et mettez-les à jour
            facilement.
          </p>
        </div>
        <Button
          variant="secondary"
          className="text-xs sm:text-sm"
          onClick={() => router.back()}
        >
          ← Retour
        </Button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-lg font-semibold text-blue-700">
                {(user.firstName || user.name || "U")[0]}
              </div>
              <div>
                <p className="text-sm text-gray-500">Nom complet</p>
                <p className="text-lg font-semibold text-gray-900">
                  {user.name || `${user.firstName} ${user.lastName}` || "—"}
                </p>
              </div>
            </div>

            <dl className="mt-6 space-y-3 text-sm text-gray-800">
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-gray-500">
                  Prénom
                </dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {user.firstName || "—"}
                </dd>
              </div>
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-gray-500">
                  Nom
                </dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {user.lastName || "—"}
                </dd>
              </div>
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-gray-500">
                  Téléphone
                </dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {user.phone || "—"}
                </dd>
              </div>
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-gray-500">
                  Email
                </dt>
                <dd className="mt-1 break-words font-medium text-gray-900">
                  {user.email}
                </dd>
              </div>
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-gray-500">
                  Rôle
                </dt>
                <dd className="mt-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      user.isAdmin
                        ? "bg-blue-50 text-blue-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {user.isAdmin ? "Admin" : "Utilisateur"}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Mise à jour
              </p>
              <h2 className="text-lg font-semibold text-gray-900">
                Modifier mes infos
              </h2>
            </div>
            {!showForm ? (
              <Button
                variant="secondary"
                className="text-xs"
                onClick={() => {
                  setShowForm(true);
                  setMessage(null);
                  setError(null);
                }}
              >
                Modifier
              </Button>
            ) : null}
          </div>
          {showForm ? (
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
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-800">
                  Nom complet
                </label>
                <input
                  {...register("name")}
                  placeholder="Nom complet"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
                />
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
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-800">
                  Email
                </label>
                <input
                  value={user.email}
                  placeholder="Email"
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
                  onClick={() => {
                    setShowForm(false);
                    setMessage(null);
                    setError(null);
                    reset({
                      name: user.name,
                      firstName: user.firstName,
                      lastName: user.lastName,
                      phone: user.phone,
                    });
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="px-6">
                  {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-600">
              Cliquez sur « Modifier » pour mettre à jour vos informations.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
