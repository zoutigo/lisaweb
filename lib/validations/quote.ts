import { z } from "zod";
import { rendezvousBaseSchema, toScheduledDate } from "./rendezvous";

function isFutureDate(dateStr?: string, timeStr?: string) {
  if (!dateStr) return true;
  try {
    const dt = timeStr ? toScheduledDate(dateStr, timeStr) : new Date(dateStr);
    const now = new Date();
    // Compare end of day if time missing
    const compareTime = timeStr
      ? dt.getTime()
      : new Date(dateStr + "T23:59:59").getTime();
    return compareTime >= now.getTime();
  } catch {
    return false;
  }
}

export const quoteRequestSchema = z.object({
  firstName: z.string().min(1, "Prénom requis").max(120).optional(),
  lastName: z.string().min(1, "Nom requis").max(120).optional(),
  email: z.string().email("Email invalide"),
  phone: z.string().min(6).max(32).optional(),
  projectDescription: z.string().min(10, "Décrivez votre projet"),
  desiredDeliveryDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || isFutureDate(val),
      "La date souhaitée ne peut pas être dans le passé",
    ),
  serviceOfferId: z.string().optional(),
  offerOptionIds: z.array(z.string()).optional().default([]),
  rendezvous: rendezvousBaseSchema
    .partial()
    .extend({
      date: z.string().optional(),
      time: z.string().optional(),
    })
    .optional()
    .superRefine((val, ctx) => {
      if (val?.date || val?.time) {
        if (!isFutureDate(val?.date, val?.time)) {
          ctx.addIssue({
            code: "custom",
            message: "La date de rendez-vous doit être dans le futur",
            path: ["date"],
          });
        }
      }
    }),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
