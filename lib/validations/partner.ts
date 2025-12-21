import { z } from "zod";

const logoUrlSchema = z.union([
  z.string().url("URL du logo invalide"),
  z.string().regex(/^\/files\//, "URL du logo invalide"),
]);

export const partnerSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(150),
  logoUrl: z.preprocess(
    (v) => (v === "" ? undefined : v),
    logoUrlSchema.optional(),
  ),
  url: z.string().url("URL invalide").min(1, "Le site est requis"),
});

export type PartnerInput = z.infer<typeof partnerSchema>;
