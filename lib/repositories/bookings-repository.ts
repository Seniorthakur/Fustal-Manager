import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { Booking, BookingFilters, BookingStatus, PaymentStatus } from "@/types/domain";

type BookingRow = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  courtId: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMins: number;
  price: number;
  amountPaid: number;
  paymentStatus: string;
  status: string;
  notes: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

function normalize(row: BookingRow): Booking {
  return {
    id: row.id,
    customerId: row.customerId,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    courtId: row.courtId,
    courtName: row.courtName,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    durationMins: Number(row.durationMins),
    price: Number(row.price),
    amountPaid: Number(row.amountPaid),
    paymentStatus: row.paymentStatus as PaymentStatus,
    status: row.status as BookingStatus,
    notes: row.notes ?? "",
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

function createData(booking: Booking): Prisma.BookingCreateInput {
  return {
    id: booking.id,
    customerId: booking.customerId,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    courtId: booking.courtId,
    courtName: booking.courtName,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    durationMins: booking.durationMins,
    price: booking.price,
    amountPaid: booking.amountPaid,
    paymentStatus: booking.paymentStatus,
    status: booking.status,
    notes: booking.notes || "",
    createdBy: booking.createdBy,
    createdAt: booking.createdAt ? new Date(booking.createdAt) : new Date(),
    updatedAt: booking.updatedAt ? new Date(booking.updatedAt) : new Date()
  };
}

function updateData(updates: Partial<Booking>): Prisma.BookingUpdateInput {
  const data: Prisma.BookingUpdateInput = {};
  if (updates.customerId !== undefined) data.customerId = updates.customerId;
  if (updates.customerName !== undefined) data.customerName = updates.customerName;
  if (updates.customerPhone !== undefined) data.customerPhone = updates.customerPhone;
  if (updates.courtId !== undefined) data.courtId = updates.courtId;
  if (updates.courtName !== undefined) data.courtName = updates.courtName;
  if (updates.date !== undefined) data.date = updates.date;
  if (updates.startTime !== undefined) data.startTime = updates.startTime;
  if (updates.endTime !== undefined) data.endTime = updates.endTime;
  if (updates.durationMins !== undefined) data.durationMins = updates.durationMins;
  if (updates.price !== undefined) data.price = updates.price;
  if (updates.amountPaid !== undefined) data.amountPaid = updates.amountPaid;
  if (updates.paymentStatus !== undefined) data.paymentStatus = updates.paymentStatus;
  if (updates.status !== undefined) data.status = updates.status;
  if (updates.notes !== undefined) data.notes = updates.notes;
  if (updates.createdBy !== undefined) data.createdBy = updates.createdBy;
  if (updates.createdAt !== undefined && updates.createdAt) data.createdAt = new Date(updates.createdAt);
  if (updates.updatedAt !== undefined && updates.updatedAt) data.updatedAt = new Date(updates.updatedAt);
  return data;
}

export const bookingsRepository = {
  async list(filters: BookingFilters = {}) {
    const rows = await prisma.booking.findMany({ orderBy: [{ date: "desc" }, { startTime: "desc" }] });
    let bookings = rows.map(normalize);

    if (filters.date) bookings = bookings.filter((booking) => booking.date === filters.date);
    if (filters.courtId) bookings = bookings.filter((booking) => booking.courtId === filters.courtId);
    if (filters.status && filters.status !== "all") bookings = bookings.filter((booking) => booking.status === filters.status);
    if (filters.paymentStatus && filters.paymentStatus !== "all") bookings = bookings.filter((booking) => booking.paymentStatus === filters.paymentStatus);
    if (filters.createdBy) bookings = bookings.filter((booking) => booking.createdBy === filters.createdBy);
    if (filters.search) {
      const query = filters.search.toLowerCase();
      bookings = bookings.filter((booking) => `${booking.customerName} ${booking.customerPhone}`.toLowerCase().includes(query));
    }

    return bookings;
  },

  async findById(id: string) {
    const row = await prisma.booking.findUnique({ where: { id } });
    return row ? normalize(row) : null;
  },

  async byDate(date: string) {
    return this.list({ date });
  },

  async byCustomer(customerId: string) {
    const rows = await prisma.booking.findMany({ where: { customerId }, orderBy: [{ date: "desc" }, { startTime: "desc" }] });
    return rows.map(normalize);
  },

  async create(booking: Booking) {
    return normalize(await prisma.booking.create({ data: createData(booking) }));
  },

  async update(id: string, updates: Partial<Booking>) {
    return normalize(await prisma.booking.update({ where: { id }, data: updateData(updates) }));
  },

  async delete(id: string) {
    await prisma.booking.delete({ where: { id } });
  }
};
