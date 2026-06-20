import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(5, "Phone is required"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  notes: z.string().optional().default("")
});

export type CustomerInput = z.infer<typeof customerSchema>;
