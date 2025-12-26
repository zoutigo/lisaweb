import { z } from "zod";

const featureInput = z.object({
  label: z.string().min(2),
  icon: z.string().optional(),
  order: z.number().int().nonnegative().optional(),
});

const stepInput = z.object({
  title: z.string().min(2),
  description: z.string().min(4),
  order: z.number().int().nonnegative().optional(),
});

const useCaseInput = z.object({
  title: z.string().min(2),
  description: z.string().min(4),
});

export const serviceOfferSchema = z.object({
  slug: z.string().min(3),
  title: z.string().min(3),
  subtitle: z.string().optional().or(z.literal("")),
  shortDescription: z.string().min(10),
  longDescription: z.string().min(20),
  targetAudience: z.string().min(3),
  priceLabel: z.string().min(2),
  durationLabel: z.string().min(2),
  engagementLabel: z.string().min(2),
  isFeatured: z.boolean().optional().default(false),
  order: z.number().int().default(0),
  ctaLabel: z.string().min(2),
  ctaLink: z.string().min(1),
  features: z.array(featureInput).optional().default([]),
  steps: z.array(stepInput).optional().default([]),
  useCases: z.array(useCaseInput).optional().default([]),
});

export type ServiceOfferInput = z.infer<typeof serviceOfferSchema>;
