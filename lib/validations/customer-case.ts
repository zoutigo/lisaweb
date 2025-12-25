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
  result1: z.string().optional(),
  result2: z.string().optional(),
  result3: z.string().optional(),
  result4: z.string().optional(),
  result5: z.string().optional(),
  feature1: z.string().optional(),
  feature2: z.string().optional(),
  feature3: z.string().optional(),
  feature4: z.string().optional(),
  feature5: z.string().optional(),
  isOnLandingPage: z.boolean().optional().default(false),
});

export type CustomerCaseInput = z.infer<typeof customerCaseSchema>;
