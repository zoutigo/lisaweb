"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { FormStatus } from "@/components/ui/form-status";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  rendezvousSchema,
  type RendezvousInput,
} from "@/lib/validations/rendezvous";

type Status = { type: "success" | "error"; message: string };

const inputClasses =
  "w-full rounded-xl border border-[#e0e7ff] bg-white px-4 py-3 text-sm text-[#1b2653] shadow-[0_8px_24px_rgba(0,0,0,0.03)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#3B5BFF]";

export default function RendezvousPage() {
  const [status, setStatus] = useState<Status | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RendezvousInput>({
    resolver: zodResolver(rendezvousSchema),
    defaultValues: {
      date: "",
      time: "",
      reason: "",
      content: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: RendezvousInput) => {
    setStatus(null);
    try {
      const response = await fetch("/api/rendezvous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          payload?.message ||
            "Impossible d'enregistrer votre demande pour le moment.",
        );
      }

      setStatus({
        type: "success",
        message:
          "Votre demande a bien été enregistrée. Je reviens vers vous rapidement.",
      });
      reset();
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue, merci de réessayer.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9fc] via-white to-[#edf1ff] text-[#111827]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,91,255,0.12),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.12),transparent_20%),radial-gradient(circle_at_60%_80%,rgba(200,243,211,0.15),transparent_25%)] blur-3xl" />
      <main>
        <Section className="pt-16 sm:pt-24">
          <div className="mx-auto max-w-4xl rounded-[28px] bg-white/80 p-8 shadow-[0_25px_80px_-35px_rgba(0,0,0,0.25)] backdrop-blur sm:p-10">
            <SectionHeading
              eyebrow="Prendre rendez-vous"
              title="Planifions un échange"
              description="Choisissez une date et un créneau, indiquez la raison du rendez-vous, et j'organise tout le reste."
              align="left"
            />

            <form
              className="mt-8 grid gap-6"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              {status ? (
                <FormStatus
                  type={status.type}
                  message={status.message}
                  title={status.type === "success" ? "C'est noté" : "Oups"}
                />
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-[#1b2653]">
                  Date souhaitée
                  <input
                    type="date"
                    {...register("date")}
                    className={inputClasses}
                  />
                  {errors.date?.message ? (
                    <span className="text-sm text-red-600">
                      {errors.date.message}
                    </span>
                  ) : null}
                </label>

                <label className="grid gap-2 text-sm font-semibold text-[#1b2653]">
                  Créneau horaire
                  <input
                    type="time"
                    {...register("time")}
                    className={inputClasses}
                  />
                  {errors.time?.message ? (
                    <span className="text-sm text-red-600">
                      {errors.time.message}
                    </span>
                  ) : null}
                </label>
              </div>

              <label className="grid gap-2 text-sm font-semibold text-[#1b2653]">
                Raison du rendez-vous
                <input
                  type="text"
                  placeholder="Brief projet, refonte, devis, maintenance..."
                  {...register("reason")}
                  className={inputClasses}
                />
                {errors.reason?.message ? (
                  <span className="text-sm text-red-600">
                    {errors.reason.message}
                  </span>
                ) : null}
              </label>

              <label className="grid gap-2 text-sm font-semibold text-[#1b2653]">
                Détails
                <textarea
                  rows={6}
                  placeholder="Expliquez vos besoins, le contexte, vos objectifs, votre délai..."
                  {...register("content")}
                  className={inputClasses}
                />
                {errors.content?.message ? (
                  <span className="text-sm text-red-600">
                    {errors.content.message}
                  </span>
                ) : null}
              </label>

              <div className="flex flex-wrap items-center gap-4">
                <SubmitButton
                  isSubmitting={isSubmitting}
                  isValid={isValid}
                  className="bg-[#3B5BFF] text-white shadow-[0_12px_30px_rgba(59,91,255,0.25)] hover:bg-[#324edb]"
                >
                  Prendre rendez-vous
                </SubmitButton>
                <p className="text-sm text-[#4b5563]">
                  Toutes les demandes reçoivent une réponse sous 24h.
                </p>
              </div>
            </form>
          </div>
        </Section>
      </main>
    </div>
  );
}
