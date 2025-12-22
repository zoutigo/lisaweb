"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { partnerSchema, PartnerInput } from "@/lib/validations/partner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormStatus } from "@/components/ui/form-status";
import Image from "next/image";

type FormData = PartnerInput;

export default function NewPartnerPage() {
  const router = useRouter();
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [logoName, setLogoName] = useState("");
  const placeholderLogo = "/partner-placeholder.svg";
  const [previewUrl, setPreviewUrl] = useState<string>(placeholderLogo);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: { name: "", logoUrl: "", url: "" },
    mode: "onChange",
  });

  const handleLogoUpload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setStatus(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/files/upload", {
      method: "POST",
      body: formData,
    });
    setUploading(false);
    if (!res.ok) {
      setStatus({ type: "error", msg: "Upload du logo échoué." });
      return;
    }
    const data: { path?: string } = await res.json();
    const path = data.path || placeholderLogo;
    setValue("logoUrl", path, { shouldValidate: true });
    setStatus({ type: "success", msg: "Logo uploadé." });
    setLogoName(file.name);
    setPreviewUrl(path);
  };

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

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">Logo</label>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800 shadow-sm transition hover:border-blue-300 hover:bg-white focus-within:border-blue-400 focus-within:bg-white">
              <div className="flex items-center gap-3">
                <Image
                  src={previewUrl}
                  alt="Logo preview"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <span>{logoName || "Choisir un fichier image"}</span>
              </div>
              <input
                type="file"
                accept="image/*"
                aria-label="Logo"
                onChange={(e) =>
                  handleLogoUpload(e.target.files?.[0] || undefined)
                }
                className="sr-only"
              />
            </label>
            <p className="text-xs text-gray-500">
              Upload vers /files. Formats image seulement.
            </p>
            {errors.logoUrl ? (
              <p className="text-xs text-red-600">{errors.logoUrl.message}</p>
            ) : null}
          </div>

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
