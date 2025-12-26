"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { contactSchema, type ContactInput } from "@/lib/validations/contact";
import { SectionHeading } from "@/components/section-heading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmMessage } from "@/components/confirm-message";

type SiteInfo = {
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
};

function formatAddress(info?: SiteInfo) {
  if (!info) return "";
  const parts = [
    info.address,
    [info.postalCode, info.city].filter(Boolean).join(" "),
    info.country,
  ]
    .filter(Boolean)
    .map((p) => p?.trim())
    .filter(Boolean);
  return parts.join(", ");
}

function buildMapSrc(info?: SiteInfo) {
  const address = formatAddress(info);
  if (!address) return "";
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

export default function ContactClient({
  initialSiteInfo,
}: {
  initialSiteInfo: SiteInfo | null;
}) {
  const { data: siteInfo } = useQuery({
    queryKey: ["siteInfo"],
    queryFn: async () => {
      const res = await fetch("/api/site-info", { cache: "no-store" });
      return (await res.json()) as SiteInfo | null;
    },
    initialData: initialSiteInfo ?? undefined,
    staleTime: 1000 * 60 * 10,
  });

  const mapSrc = useMemo(() => buildMapSrc(siteInfo ?? undefined), [siteInfo]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      phone: "",
      reason: "",
      message: "",
      captchaAnswer: undefined,
      captchaExpected: Math.floor(Math.random() * 10) + 5, // 5..14
    },
  });

  const [status, setStatus] = useState<"success" | "error" | null>(null);

  const onSubmit = async (values: ContactInput) => {
    setStatus(null);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setStatus("error");
      return;
    }
    setStatus("success");
    reset({
      email: "",
      phone: "",
      reason: "",
      message: "",
      captchaAnswer: undefined,
      captchaExpected: Math.floor(Math.random() * 10) + 5,
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Coordonnées"
          title="Toutes les infos pour me joindre"
          description="Email, téléphone et localisation basés sur les données du site."
          align="left"
        />
        <Card className="border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <div className="space-y-2 text-sm text-[#1f2937]">
            <p className="text-xs uppercase tracking-[0.2em] text-[#6b7280]">
              Coordonnées
            </p>
            <p>Email : {siteInfo?.email || "contact@lisaweb.fr"}</p>
            <p>Tél : {siteInfo?.phone || "Non renseigné"}</p>
            <p>
              Adresse :{" "}
              {formatAddress(siteInfo ?? undefined) || "Non renseignée"}
            </p>
          </div>
          {mapSrc ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-[#e5e7eb] shadow-sm">
              <iframe
                title="Localisation"
                src={mapSrc}
                className="h-64 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          ) : null}
        </Card>
      </div>

      <Card className="border border-[#e5e7eb] bg-white p-6 shadow-sm">
        <SectionHeading
          eyebrow="Écrire un message"
          title="Formulaire de contact"
          description="Laissez vos coordonnées, je vous réponds rapidement."
          align="left"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label
                className="text-sm font-semibold text-[#1f2937]"
                htmlFor="contact-email"
              >
                Email
              </label>
              <input
                id="contact-email"
                {...register("email")}
                className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-sm text-[#111827] focus:border-[#3b5bff] focus:bg-white focus:outline-none"
                placeholder="vous@email.com"
              />
              {errors.email ? (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1">
              <label
                className="text-sm font-semibold text-[#1f2937]"
                htmlFor="contact-phone"
              >
                Téléphone
              </label>
              <input
                id="contact-phone"
                {...register("phone")}
                className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-sm text-[#111827] focus:border-[#3b5bff] focus:bg-white focus:outline-none"
                placeholder="+33 6 xx xx xx xx"
              />
              {errors.phone ? (
                <p className="text-xs text-red-600">{errors.phone.message}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-semibold text-[#1f2937]"
              htmlFor="contact-reason"
            >
              Sujet
            </label>
            <input
              id="contact-reason"
              {...register("reason")}
              className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-sm text-[#111827] focus:border-[#3b5bff] focus:bg-white focus:outline-none"
              placeholder="Prendre un rendez-vous, refonte de site, etc."
            />
            {errors.reason ? (
              <p className="text-xs text-red-600">{errors.reason.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-semibold text-[#1f2937]"
              htmlFor="contact-message"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              {...register("message")}
              rows={4}
              className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-sm text-[#111827] focus:border-[#3b5bff] focus:bg-white focus:outline-none"
              placeholder="Expliquez votre besoin..."
            />
            {errors.message ? (
              <p className="text-xs text-red-600">{errors.message.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-semibold text-[#1f2937]"
              htmlFor="contact-captcha"
            >
              Vérification anti-robot
            </label>
            <div className="flex items-center gap-2 rounded-xl bg-[#f9fafb] px-3 py-2 text-sm text-[#111827]">
              <span
                className="text-sm text-[#374151]"
                aria-label="question-anti-robot"
              >
                {/* eslint-disable-next-line react-hooks/incompatible-library */}
                Combien vaut {watch("captchaExpected") ?? 0} ?
              </span>
              <input
                id="contact-captcha"
                type="number"
                {...register("captchaAnswer", { valueAsNumber: true })}
                className="w-20 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#111827] focus:border-[#3b5bff] focus:outline-none"
              />
            </div>
            {errors.captchaAnswer ? (
              <p className="text-xs text-red-600">
                {errors.captchaAnswer.message}
              </p>
            ) : errors.captchaExpected ? (
              <p className="text-xs text-red-600">
                {errors.captchaExpected.message}
              </p>
            ) : errors.root ? (
              <p className="text-xs text-red-600">{errors.root.message}</p>
            ) : null}
          </div>

          {status === "success" ? (
            <ConfirmMessage
              type="success"
              message="Message envoyé, merci ! Je reviens vers vous rapidement."
            />
          ) : null}
          {status === "error" ? (
            <ConfirmMessage
              type="error"
              message="Envoi impossible pour le moment. Merci de réessayer."
            />
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !isValid}>
              {isSubmitting ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
