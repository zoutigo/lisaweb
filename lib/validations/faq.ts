import { z } from "zod";

export const faqSchema = z.object({
  question: z
    .string()
    .min(5, "La question doit contenir au moins 5 caractères")
    .max(500, "500 caractères maximum"),
  answer: z
    .string()
    .min(5, "La réponse doit contenir au moins 5 caractères")
    .max(2000, "2000 caractères maximum"),
});

export type FaqInput = z.infer<typeof faqSchema>;
