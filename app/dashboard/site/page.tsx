"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { siteInfoSchema, SiteInfoInput } from "@/lib/validations/site-info";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormStatus } from "@/components/ui/form-status";
import { Section } from "@/components/section";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

type FormData = SiteInfoInput;

export default function SiteAdminPage() {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["siteInfo"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/site", { cache: "no-store" });
      return (await res.json()) as Partial<FormData> | null;
    },
  });
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(siteInfoSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      phone: "",
    },
    mode: "onChange",
  });

  // react-hooks/incompatible-library: watch is part of react-hook-form API
  // eslint-disable-next-line react-hooks/incompatible-library
  const values = watch();

  useEffect(() => {
    if (data) reset(data as FormData);
  }, [data, reset]);

  const onSubmit = async (values: FormData) => {
    setStatus(null);
    const res = await fetch("/api/dashboard/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setStatus({ type: "error", msg: "Échec de l'enregistrement." });
      return;
    }
    setStatus({ type: "success", msg: "Informations mises à jour." });
    queryClient.invalidateQueries({ queryKey: ["siteInfo"] });
    setMode("view");
  };

  const form = (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-800">
          Nom du site
        </label>
        <input
          {...register("name")}
          placeholder="Nom du site"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
        />
        {errors.name ? (
          <p className="text-xs text-red-600">{errors.name.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-800">Email</label>
        <input
          {...register("email")}
          placeholder="contact@exemple.com"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
        />
        {errors.email ? (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        ) : null}
      </div>
      {(["address", "city", "postalCode", "country", "phone"] as const).map(
        (field) => (
          <div key={field} className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">
              {field === "postalCode"
                ? "Code postal"
                : field === "phone"
                  ? "Téléphone"
                  : field === "address"
                    ? "Adresse"
                    : field === "city"
                      ? "Ville"
                      : "Pays"}
            </label>
            <input
              {...register(field)}
              placeholder={
                field === "address"
                  ? "123 rue Principale"
                  : field === "city"
                    ? "Paris"
                    : field === "postalCode"
                      ? "75000"
                      : field === "country"
                        ? "France"
                        : "+33 1 23 45 67 89"
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
            />
            {errors[field]?.message ? (
              <p className="text-xs text-red-600">
                {errors[field]?.message as string}
              </p>
            ) : null}
          </div>
        ),
      )}

      {status ? (
        <FormStatus type={status.type} message={status.msg} className="mt-1" />
      ) : null}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setMode("view");
            setStatus(null);
          }}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );

  return (
    <Section>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
              Tableau de bord
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              Informations du site
            </h1>
            <p className="text-sm text-gray-600">
              Consultez et mettez à jour les coordonnées publiques.
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

        <div className="mt-6">
          <Card className="bg-white p-6 shadow-sm border border-gray-200">
            {isLoading ? (
              <div className="text-sm text-gray-600">Chargement...</div>
            ) : mode === "edit" ? (
              form
            ) : (
              <div className="grid gap-3 text-sm text-gray-800">
                {[
                  ["Nom du site", "name"],
                  ["Email", "email"],
                  ["Adresse", "address"],
                  ["Ville", "city"],
                  ["Code postal", "postalCode"],
                  ["Pays", "country"],
                  ["Téléphone", "phone"],
                ].map(([label, key]) => (
                  <div key={key} className="rounded-xl bg-gray-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      {label}
                    </p>
                    <p className="mt-1 font-medium text-gray-900">
                      {(() => {
                        switch (key) {
                          case "name":
                            return values.name || "—";
                          case "email":
                            return values.email || "—";
                          case "address":
                            return values.address || "—";
                          case "city":
                            return values.city || "—";
                          case "postalCode":
                            return values.postalCode || "—";
                          case "country":
                            return values.country || "—";
                          case "phone":
                            return values.phone || "—";
                          default:
                            return "—";
                        }
                      })()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
          {mode === "view" ? (
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setMode("edit")}>Modifier</Button>
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
