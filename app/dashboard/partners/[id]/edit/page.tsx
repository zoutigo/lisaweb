"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { partnerSchema, PartnerInput } from "@/lib/validations/partner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormStatus } from "@/components/ui/form-status";
import { UploadImageInput } from "@/components/ui/upload-image-input";
const placeholderLogo = "/partner-placeholder.svg";

type FormData = PartnerInput;

export default function EditPartnerPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isValid },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: { name: "", logoUrl: "", url: "" },
    mode: "onChange",
  });

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) throw new Error("missing id");
        const res = await fetch(`/api/dashboard/partners/${id}`);
        if (!res.ok) throw new Error("fetch failed");
        const data: { name?: string; logoUrl?: string; url?: string } =
          await res.json();
        reset({
          name: data.name || "",
          logoUrl: data.logoUrl || "",
          url: data.url || "",
        });
      } catch {
        setError("Impossible de charger le partenaire");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, reset]);

  const onSubmit = async (values: FormData) => {
    if (!id) return;
    setError(null);
    const res = await fetch(`/api/dashboard/partners/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setError("Échec de la mise à jour");
      return;
    }
    router.push("/dashboard/partners");
    router.refresh();
  };

  const [uploading, setUploading] = useState(false);
  const logoUrlValue = watch("logoUrl") || placeholderLogo;

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
            Modifier le partenaire
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Mettez à jour les informations principales du partenaire.
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

      <Card className="bg-white p-6 shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <input type="hidden" {...register("logoUrl")} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">Nom</label>
            <input
              {...register("name")}
              placeholder="Nom du partenaire"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
            />
            {errors.name ? (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            ) : null}
          </div>

          <UploadImageInput
            label="Logo"
            value={logoUrlValue}
            onChange={(url) =>
              setValue("logoUrl", url, { shouldValidate: true })
            }
            onUploadingChange={setUploading}
            onError={(msg) => (msg ? setError(msg) : setError(null))}
            helperText="Upload vers /files. Formats image seulement."
          />
          {errors.logoUrl ? (
            <p className="text-xs text-red-600">{errors.logoUrl.message}</p>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">
              Site web
            </label>
            <input
              {...register("url")}
              placeholder="https://exemple.com"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none"
            />
            {errors.url ? (
              <p className="text-xs text-red-600">{errors.url.message}</p>
            ) : null}
          </div>

          {error ? (
            <FormStatus type="error" message={error} className="mt-2" />
          ) : null}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                isSubmitting || uploading || !isValid || !!errors.logoUrl
              }
            >
              {isSubmitting || uploading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
