import { z } from "zod";

export const settingsSchema = z.object({
  facilityName: z.string().min(2),
  address: z.string().min(2),
  contact: z.string().min(3),
  currency: z.string().min(3).max(3),
  timezone: z.string().min(3),
  defaultSlotLengthMins: z.coerce.number().min(30).max(120),
  defaultOpenTime: z.string().regex(/^\d{2}:\d{2}$/),
  defaultCloseTime: z.string().regex(/^\d{2}:\d{2}$/)
});
