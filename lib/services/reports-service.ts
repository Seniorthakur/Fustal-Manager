import "server-only";

import { eachDayOfInterval, format, parseISO, subDays } from "date-fns";
import { bookingsRepository } from "@/lib/repositories/bookings-repository";
import { courtsRepository } from "@/lib/repositories/courts-repository";
import { customersRepository } from "@/lib/repositories/customers-repository";
import { adminsRepository } from "@/lib/repositories/admins-repository";
import type { Booking } from "@/types/domain";

function isRevenueBooking(booking: Booking) {
  return booking.status !== "cancelled" && booking.status !== "blocked";
}

export async function getDashboardMetrics() {
  const [bookings, courts] = await Promise.all([bookingsRepository.list(), courtsRepository.list()]);
  const today = format(new Date(), "yyyy-MM-dd");
  const todaysBookings = bookings.filter((booking) => booking.date === today && booking.status !== "cancelled");
  const revenueCollected = bookings.filter(isRevenueBooking).reduce((sum, booking) => sum + booking.amountPaid, 0);
  const outstanding = bookings.filter(isRevenueBooking).reduce((sum, booking) => sum + Math.max(booking.price - booking.amountPaid, 0), 0);
  const availableCourtHours = courts.filter((court) => court.status === "active").length * 16;
  const bookedHoursToday = todaysBookings.reduce((sum, booking) => sum + booking.durationMins / 60, 0);
  const occupancy = availableCourtHours > 0 ? Math.round((bookedHoursToday / availableCourtHours) * 100) : 0;
  const nextBookings = bookings
    .filter((booking) => `${booking.date} ${booking.startTime}` >= `${today} ${format(new Date(), "HH:mm")}` && booking.status !== "cancelled")
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
    .slice(0, 5);

  return {
    totalBookingsToday: todaysBookings.length,
    occupancy,
    revenueCollected,
    outstanding,
    nextBookings
  };
}

export async function bookingsPerDay(days = 7) {
  const bookings = await bookingsRepository.list();
  const interval = eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() });
  return interval.map((date) => {
    const key = format(date, "yyyy-MM-dd");
    const dayBookings = bookings.filter((booking) => booking.date === key && booking.status !== "cancelled");
    return {
      date: format(date, "MMM d"),
      bookings: dayBookings.length,
      revenue: dayBookings.reduce((sum, booking) => sum + booking.amountPaid, 0)
    };
  });
}

export async function occupancyByCourt() {
  const [bookings, courts] = await Promise.all([bookingsRepository.list(), courtsRepository.list()]);
  return courts.map((court) => {
    const courtBookings = bookings.filter((booking) => booking.courtId === court.id && booking.status !== "cancelled");
    const hours = courtBookings.reduce((sum, booking) => sum + booking.durationMins / 60, 0);
    return { court: court.name, hours, bookings: courtBookings.length };
  });
}

export async function getReports() {
  const [bookings, customers, admins] = await Promise.all([bookingsRepository.list(), customersRepository.list(), adminsRepository.list()]);
  const revenueByDayMap = new Map<string, number>();
  for (const booking of bookings.filter(isRevenueBooking)) {
    revenueByDayMap.set(booking.date, (revenueByDayMap.get(booking.date) ?? 0) + booking.amountPaid);
  }
  const revenueByDay = [...revenueByDayMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, revenue]) => ({ date, revenue }));

  const topCustomers = customers
    .map((customer) => {
      const customerBookings = bookings.filter((booking) => booking.customerId === customer.id);
      return {
        customer: customer.name,
        bookings: customerBookings.length,
        revenue: customerBookings.reduce((sum, booking) => sum + booking.amountPaid, 0),
        outstanding: customerBookings.reduce((sum, booking) => sum + Math.max(booking.price - booking.amountPaid, 0), 0)
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const bookingsByAdmin = admins.map((admin) => {
    const adminBookings = bookings.filter((booking) => booking.createdBy === admin.id);
    return {
      admin: admin.name,
      role: admin.role,
      bookings: adminBookings.length,
      revenue: adminBookings.reduce((sum, booking) => sum + booking.amountPaid, 0)
    };
  });

  return { revenueByDay, topCustomers, bookingsByAdmin };
}
