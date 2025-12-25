import { z } from "zod";

const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

export const rendezvousBaseSchema = z.object({
  date: z
    .string()
    .min(1, "Choisis une date")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Date invalide",
    ),
  time: z.string().regex(timeRegex, "Heure invalide (HH:MM)"),
  reason: z
    .string()
    .min(3, "Décris brièvement la raison")
    .max(120, "120 caractères maximum"),
  content: z
    .string()
    .min(10, "Merci de donner quelques détails")
    .max(2000, "2000 caractères maximum"),
});

function addFutureDateGuard<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((value, ctx) => {
    try {
      const { date, time } = value as { date?: string; time?: string };
      const dt = toScheduledDate(date ?? "", time ?? "");
      const now = new Date();
      if (dt.getTime() < now.getTime()) {
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
}

export const rendezvousSchema = addFutureDateGuard(rendezvousBaseSchema);

export type RendezvousInput = z.infer<typeof rendezvousSchema>;

export function toScheduledDate(date: string, time: string) {
  const datetime = new Date(`${date}T${time}`);
  if (Number.isNaN(datetime.getTime())) {
    throw new Error("Date ou heure invalide");
  }
  return datetime;
}
