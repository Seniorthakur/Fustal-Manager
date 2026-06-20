import { z } from "zod";

export const courtSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["indoor", "outdoor"]),
  openTime: z.string().regex(/^\d{2}:\d{2}$/),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/),
  status: z.enum(["active", "inactive", "maintenance"])
});

export const pricingRuleSchema = z.object({
  courtId: z.string().min(1),
  dayOfWeek: z.string().min(3),
  startWindow: z.string().regex(/^\d{2}:\d{2}$/),
  endWindow: z.string().regex(/^\d{2}:\d{2}$/),
  isPeak: z.coerce.boolean().default(false),
  hourlyRate: z.coerce.number().min(0)
});
