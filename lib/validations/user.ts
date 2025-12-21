import { z } from "zod";

const frenchPhoneRegex = /^(\+33|0)[1-9](?:[ .-]?\d{2}){4}$/;

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z
    .string()
    .regex(frenchPhoneRegex, "Numéro de téléphone français invalide")
    .optional(),
  isAdmin: z.boolean().optional(),
});

export type UserUpdate = z.infer<typeof userUpdateSchema>;

export const userSelfUpdateSchema = userUpdateSchema.omit({ isAdmin: true });
export type UserSelfUpdate = z.infer<typeof userSelfUpdateSchema>;
