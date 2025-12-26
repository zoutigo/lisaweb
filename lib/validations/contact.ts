import { z } from "zod";

export const contactSchema = z
  .object({
    email: z.string().email("Email invalide"),
    phone: z
      .string()
      .min(8, "Téléphone requis")
      .regex(/^[0-9+().\s-]+$/, "Format de téléphone invalide"),
    reason: z.string().min(3, "Précisez la raison du message"),
    message: z.string().min(10, "Message trop court"),
    captchaAnswer: z.coerce
      .number({
        required_error: "Merci de répondre à la question",
        invalid_type_error: "Réponse invalide",
      })
      .int(),
    captchaExpected: z.coerce.number().int(),
  })
  .refine(
    (data) => data.captchaAnswer === data.captchaExpected,
    "La vérification anti-robot a échoué",
  );

export type ContactInput = z.infer<typeof contactSchema>;
