import "server-only";

import { ACTIVE_BOOKING_STATUSES } from "@/lib/constants";
import { bookingsRepository } from "@/lib/repositories/bookings-repository";
import { courtsRepository } from "@/lib/repositories/courts-repository";
import { customersRepository } from "@/lib/repositories/customers-repository";
import { addMinutesToTime, overlaps } from "@/lib/utils/dates";
import { newId } from "@/lib/utils/ids";
import type { Booking } from "@/types/domain";
import type { BookingFormInput } from "@/lib/validation/booking.schema";
import { calculateBookingPrice } from "./pricing-service";

export async function assertNoBookingConflict(input: {
  bookingId?: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  const bookings = await bookingsRepository.list({ date: input.date, courtId: input.courtId });
  const conflict = bookings.find((booking) => {
    if (booking.id === input.bookingId) return false;
    if (!ACTIVE_BOOKING_STATUSES.includes(booking.status as (typeof ACTIVE_BOOKING_STATUSES)[number])) return false;
    return overlaps(input.startTime, input.endTime, booking.startTime, booking.endTime);
  });

  if (conflict) {
    throw new Error(`Court already has ${conflict.customerName} from ${conflict.startTime} to ${conflict.endTime}.`);
  }
}

export async function buildBookingFromInput(input: BookingFormInput, createdBy: string, existingId?: string): Promise<Booking> {
  const court = await courtsRepository.findById(input.courtId);
  if (!court) throw new Error("Selected court does not exist.");
  if (court.status !== "active") throw new Error("Selected court is not active.");

  let customerId = input.customerId;
  let customerName = input.customerName.trim();
  let customerPhone = input.customerPhone.trim();

  if (customerId) {
    const selectedCustomer = await customersRepository.findById(customerId);
    if (!selectedCustomer) throw new Error("Selected customer does not exist.");
    customerName = selectedCustomer.name;
    customerPhone = selectedCustomer.phone;
  } else {
    const existing = await customersRepository.findByPhone(customerPhone);
    if (existing) {
      customerId = existing.id;
      customerName = existing.name;
      customerPhone = existing.phone;
    } else {
      const customer = {
        id: newId("cust"),
        name: customerName,
        phone: customerPhone,
        email: "",
        createdAt: new Date().toISOString(),
        notes: "Created from booking form"
      };
      await customersRepository.create(customer);
      customerId = customer.id;
    }
  }

  const endTime = addMinutesToTime(input.startTime, input.durationMins);
  await assertNoBookingConflict({ bookingId: existingId, courtId: input.courtId, date: input.date, startTime: input.startTime, endTime });

  const calculated = await calculateBookingPrice({
    courtId: input.courtId,
    date: input.date,
    startTime: input.startTime,
    endTime,
    durationMins: input.durationMins
  });

  const now = new Date().toISOString();
  return {
    id: existingId ?? newId("booking"),
    customerId,
    customerName,
    customerPhone,
    courtId: input.courtId,
    courtName: court.name,
    date: input.date,
    startTime: input.startTime,
    endTime,
    durationMins: input.durationMins,
    price: input.price > 0 ? input.price : calculated.computedPrice,
    amountPaid: input.amountPaid,
    paymentStatus: input.paymentStatus,
    status: input.status,
    notes: input.notes ?? "",
    createdBy,
    createdAt: now,
    updatedAt: now
  };
}

export async function createBooking(input: BookingFormInput, createdBy: string) {
  const booking = await buildBookingFromInput(input, createdBy);
  return bookingsRepository.create(booking);
}

export async function updateBooking(id: string, input: BookingFormInput, updatedBy: string) {
  const existing = await bookingsRepository.findById(id);
  if (!existing) throw new Error("Booking not found.");
  const next = await buildBookingFromInput(input, existing.createdBy || updatedBy, id);
  next.createdAt = existing.createdAt;
  next.updatedAt = new Date().toISOString();
  return bookingsRepository.update(id, next);
}
