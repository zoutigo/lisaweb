"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { partnerSchema, PartnerInput } from "@/lib/validations/partner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormStatus } from "@/components/ui/form-status";
import { UploadImageInput } from "@/components/ui/upload-image-input";

type FormData = PartnerInput;

export default function NewPartnerPage() {
  const router = useRouter();
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: { name: "", logoUrl: "", url: "" },
    mode: "onChange",
  });

  const onSubmit = async (values: FormData) => {
    setStatus(null);
    const res = await fetch("/api/dashboard/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setStatus({ type: "error", msg: "Création échouée." });
      return;
    }
    setStatus({ type: "success", msg: "Partenaire créé." });
    router.push("/dashboard/partners");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Nouveau
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            Créer un partenaire
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Ajoutez un partenaire avec son nom, son logo et son site web.
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

          {(() => {
            // eslint-disable-next-line react-hooks/incompatible-library
            const logoValue = watch("logoUrl") || undefined;
            return (
              <UploadImageInput
                label="Logo"
                value={logoValue}
                onChange={(url) =>
                  setValue("logoUrl", url, { shouldValidate: true })
                }
                onUploadingChange={setUploading}
                onError={(msg) =>
                  msg ? setStatus({ type: "error", msg }) : setStatus(null)
                }
                helperText="Upload vers /files. Formats image seulement."
              />
            );
          })()}
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

          {status ? (
            <FormStatus
              type={status.type}
              message={status.msg}
              className="mt-2"
            />
          ) : null}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                isSubmitting || uploading || !isValid || !!errors.logoUrl
              }
            >
              {isSubmitting || uploading ? "Création..." : "Créer"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
