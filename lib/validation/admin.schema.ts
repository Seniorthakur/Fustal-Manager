import { z } from "zod";

const securePassword = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number");

export const createAdminSchema = z.object({
  name: z.string().min(2, "Name is required"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9._-]+$/, "Use letters, numbers, dots, dashes, or underscores only"),
  temporaryPassword: securePassword.optional().or(z.literal(""))
});

export const resetPasswordSchema = z.object({
  adminId: z.string().min(1),
  temporaryPassword: securePassword
});
