import { z } from "zod";

export const pricingTypeValues = [
  "FIXED",
  "FROM",
  "PER_UNIT",
  "QUOTE_ONLY",
] as const;

export const offerOptionSchema = z
  .object({
    slug: z.string().min(3),
    title: z.string().min(3),
    descriptionShort: z.string().min(10),
    descriptionLong: z.string().min(20),
    pricingType: z.enum(pricingTypeValues),
    priceCents: z.number().int().nonnegative().optional(),
    priceFromCents: z.number().int().nonnegative().optional(),
    unitLabel: z.string().optional(),
    unitPriceCents: z.number().int().nonnegative().optional(),
    isPopular: z.boolean().optional().default(false),
    order: z.number().int().default(0),
    constraintsJson: z.string().optional(),
  })
  .refine(
    (val) => {
      if (val.pricingType === "FIXED")
        return typeof val.priceCents === "number";
      if (val.pricingType === "FROM")
        return typeof val.priceFromCents === "number";
      if (val.pricingType === "PER_UNIT")
        return typeof val.unitPriceCents === "number" && !!val.unitLabel;
      return true;
    },
    { message: "Données incohérentes avec le type de prix" },
  );

export type OfferOptionInput = z.infer<typeof offerOptionSchema>;
