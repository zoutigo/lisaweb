import { z } from "zod";

export const customerCaseSchema = z.object({
  title: z.string().min(3, "Le titre est requis"),
  customer: z.string().optional(),
  description: z.string().min(10, "La description est requise"),
  url: z.string().url("URL invalide").optional().or(z.literal("")),
  imageUrl: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z
      .union([
        z.string().url("URL d'image invalide"),
        z.string().regex(/^\/files\//, "URL d'image invalide"),
      ])
      .optional(),
  ),
  results: z
    .array(
      z.object({
        label: z.string().min(2),
        slug: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
  features: z
    .array(
      z.object({
        label: z.string().min(2),
        slug: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
});

export type CustomerCaseInput = z.infer<typeof customerCaseSchema>;
