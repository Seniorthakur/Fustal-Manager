"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth/require-session";
import { bookingsRepository } from "@/lib/repositories/bookings-repository";
import { bookingFormSchema } from "@/lib/validation/booking.schema";
import { createBooking, updateBooking } from "@/lib/services/booking-service";
import { writeAuditLog } from "@/lib/services/audit-service";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function createBookingAction(formData: FormData) {
  const user = await requirePermission("bookings:create");
  const input = bookingFormSchema.parse(Object.fromEntries(formData.entries()));
  const booking = await createBooking(input, user.id);
  await writeAuditLog({
    actorId: user.id,
    actorName: user.name,
    action: "booking.create",
    entityType: "booking",
    entityId: booking.id,
    details: JSON.stringify({ customerName: booking.customerName, courtName: booking.courtName, date: booking.date, startTime: booking.startTime })
  });
  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/bookings");
  redirect("/bookings");
}

export async function updateBookingAction(formData: FormData): Promise<void> {
  const user = await requirePermission("bookings:update");
  const id = getString(formData, "id");
  const input = bookingFormSchema.parse(Object.fromEntries(formData.entries()));
  const booking = await updateBooking(id, input, user.id);
  await writeAuditLog({
    actorId: user.id,
    actorName: user.name,
    action: "booking.update",
    entityType: "booking",
    entityId: booking.id,
    details: JSON.stringify({ customerName: booking.customerName, courtName: booking.courtName, date: booking.date, startTime: booking.startTime })
  });
  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/bookings");
}

export async function cancelBookingAction(formData: FormData): Promise<void> {
  const user = await requirePermission("bookings:cancel");
  const id = getString(formData, "id");
  const reason = getString(formData, "reason") || "No reason provided";
  const booking = await bookingsRepository.update(id, { status: "cancelled", notes: reason, updatedAt: new Date().toISOString() });
  await writeAuditLog({
    actorId: user.id,
    actorName: user.name,
    action: "booking.cancel",
    entityType: "booking",
    entityId: id,
    details: reason
  });
  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/bookings");
}


export async function deleteBookingAction(formData: FormData): Promise<void> {
  const user = await requirePermission("bookings:delete");
  const id = getString(formData, "id");
  const booking = await bookingsRepository.findById(id);
  if (!booking) throw new Error("Booking not found.");
  await bookingsRepository.delete(id);
  await writeAuditLog({
    actorId: user.id,
    actorName: user.name,
    action: "booking.delete",
    entityType: "booking",
    entityId: id,
    details: JSON.stringify({ customerName: booking.customerName, courtName: booking.courtName, date: booking.date, startTime: booking.startTime })
  });
  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/bookings");
}

export async function markBookingPaidAction(formData: FormData): Promise<void> {
  const user = await requirePermission("bookings:mark_paid");
  const id = getString(formData, "id");
  const booking = await bookingsRepository.findById(id);
  if (!booking) throw new Error("Booking not found.");
  const amountPaid = Number(formData.get("amountPaid") ?? booking.price);
  const next = await bookingsRepository.update(id, {
    amountPaid,
    paymentStatus: amountPaid >= booking.price ? "paid" : amountPaid > 0 ? "partial" : "unpaid",
    updatedAt: new Date().toISOString()
  });
  await writeAuditLog({
    actorId: user.id,
    actorName: user.name,
    action: "booking.mark_paid",
    entityType: "booking",
    entityId: id,
    details: JSON.stringify({ amountPaid })
  });
  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/bookings");
}
