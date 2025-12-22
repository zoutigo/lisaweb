import { z } from "zod";

const frenchPhoneRegex = /^(\+33|0)[1-9](?:[ .-]?\d{2}){4}$/;

export const siteInfoSchema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(150, "Nom trop long"),
  email: z.string().trim().email("Email invalide"),
  address: z
    .string()
    .trim()
    .min(1, "Adresse requise")
    .max(255, "Adresse trop longue"),
  city: z.string().trim().min(1, "Ville requise").max(255, "Ville trop longue"),
  postalCode: z
    .string()
    .trim()
    .min(1, "Code postal requis")
    .max(50, "Code postal trop long"),
  country: z.string().trim().min(1, "Pays requis").max(255, "Pays trop long"),
  phone: z
    .string()
    .trim()
    .regex(frenchPhoneRegex, "Téléphone français invalide"),
});

export type SiteInfoInput = z.infer<typeof siteInfoSchema>;
