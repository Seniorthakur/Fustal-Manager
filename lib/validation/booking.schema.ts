import { z } from "zod";

export const bookingFormSchema = z.object({
  customerId: z.string().optional().default(""),
  customerName: z.string().min(2, "Customer name is required"),
  customerPhone: z.string().min(5, "Phone number is required"),
  courtId: z.string().min(1, "Court is required"),
  date: z.string().min(10, "Date is required"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm time"),
  durationMins: z.coerce.number().min(30).max(240),
  price: z.coerce.number().min(0),
  amountPaid: z.coerce.number().min(0),
  paymentStatus: z.enum(["unpaid", "partial", "paid"]),
  status: z.enum(["booked", "pending_payment", "completed", "cancelled", "blocked"]),
  notes: z.string().optional().default("")
});

export type BookingFormInput = z.infer<typeof bookingFormSchema>;
