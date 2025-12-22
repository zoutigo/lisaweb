"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userUpdateSchema } from "@/lib/validations/user";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type FormData = z.infer<typeof userUpdateSchema>;

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const router = useRouter();

  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(userUpdateSchema),
  });

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/dashboard/users/${id}`);
        if (!res.ok) throw new Error("fetch failed");
        const data: Partial<FormData> & { email?: string } = await res.json();
        reset({
          name: data.name,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          isAdmin: data.isAdmin,
        });
        setUserEmail(data.email || "");
      } catch {
        setError("Impossible de charger l'utilisateur");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, reset]);

  const onSubmit = async (values: FormData) => {
    if (!id) return;
    setError(null);
    const res = await fetch(`/api/dashboard/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setError("Échec de la mise à jour");
      return;
    }
    router.push("/dashboard/users");
  };

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Edition
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            Modifier l&apos;utilisateur
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Mettez à jour les informations principales de l&apos;utilisateur.
          </p>
        </div>
        <Button
          variant="secondary"
          className="text-xs"
          onClick={() => router.back()}
        >
          ← Retour
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
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
              <label className="text-sm font-semibold text-gray-800">Nom</label>
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
            <label className="text-sm font-semibold text-gray-800">Email</label>
            <input
              value={userEmail}
              placeholder="Email"
              disabled
              readOnly
              className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-700"
            />
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800">
            <input
              type="checkbox"
              {...register("isAdmin")}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400"
            />{" "}
            Admin
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
