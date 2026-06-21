import { addDays, format } from "date-fns";
import bcrypt from "bcryptjs";
import { DEFAULT_SETTINGS } from "../constants";
import { prisma } from "./prisma";

export async function seedDatabase(options: { reset?: boolean } = {}) {
  const reset = options.reset ?? false;
  const now = new Date();
  const today = format(now, "yyyy-MM-dd");
  const tomorrow = format(addDays(now, 1), "yyyy-MM-dd");

  if (reset) {
    await prisma.$transaction([
      prisma.auditLog.deleteMany(),
      prisma.booking.deleteMany(),
      prisma.pricingRule.deleteMany(),
      prisma.customer.deleteMany(),
      prisma.court.deleteMany(),
      prisma.admin.deleteMany(),
      prisma.setting.deleteMany()
    ]);
  }

  const ownerPassword = process.env.SEED_SUPER_ADMIN_PASSWORD || "ChangeMe123!";
  const ownerUsername = (process.env.SEED_SUPER_ADMIN_USERNAME || "owner").trim().toLowerCase();
  const ownerName = process.env.SEED_SUPER_ADMIN_NAME || "Owner";

  await prisma.admin.upsert({
    where: { username: ownerUsername },
    update: {
      name: ownerName,
      passwordHash: await bcrypt.hash(ownerPassword, 12),
      role: "super_admin",
      status: "active"
    },
    create: {
      id: "admin_super_owner",
      name: ownerName,
      username: ownerUsername,
      passwordHash: await bcrypt.hash(ownerPassword, 12),
      role: "super_admin",
      status: "active",
      lastLoginAt: null,
      createdAt: now
    }
  });

  await prisma.admin.upsert({
    where: { username: "staff" },
    update: {
      passwordHash: await bcrypt.hash("StaffPass123!", 12),
      role: "booking_admin",
      status: "active"
    },
    create: {
      id: "admin_staff_1",
      name: "Booking Staff",
      username: "staff",
      passwordHash: await bcrypt.hash("StaffPass123!", 12),
      role: "booking_admin",
      status: "active",
      lastLoginAt: null,
      createdAt: now
    }
  });

  const courts = [
    { id: "court_a", name: "Court A", type: "indoor", openTime: "06:00", closeTime: "22:00", status: "active" },
    { id: "court_b", name: "Court B", type: "indoor", openTime: "06:00", closeTime: "22:00", status: "active" },
    { id: "court_c", name: "Court C", type: "outdoor", openTime: "07:00", closeTime: "21:00", status: "maintenance" }
  ];

  for (const court of courts) {
    await prisma.court.upsert({ where: { id: court.id }, update: court, create: court });
  }

  const pricingRules = [
    { id: "price_a_weekday", courtId: "court_a", dayOfWeek: "weekday", startWindow: "06:00", endWindow: "17:00", isPeak: false, hourlyRate: 1800 },
    { id: "price_a_peak", courtId: "court_a", dayOfWeek: "weekday", startWindow: "17:00", endWindow: "22:00", isPeak: true, hourlyRate: 2500 },
    { id: "price_b_weekday", courtId: "court_b", dayOfWeek: "weekday", startWindow: "06:00", endWindow: "17:00", isPeak: false, hourlyRate: 1600 },
    { id: "price_b_peak", courtId: "court_b", dayOfWeek: "weekday", startWindow: "17:00", endWindow: "22:00", isPeak: true, hourlyRate: 2300 },
    { id: "price_weekend", courtId: "all", dayOfWeek: "weekend", startWindow: "06:00", endWindow: "22:00", isPeak: true, hourlyRate: 2600 }
  ];

  for (const rule of pricingRules) {
    await prisma.pricingRule.upsert({ where: { id: rule.id }, update: rule, create: rule });
  }

  const customers = [
    { id: "cust_ram", name: "Ram FC", phone: "+977980000001", email: "ramfc@example.com", createdAt: now, notes: "Prefers evening slots" },
    { id: "cust_lalit", name: "Lalitpur Legends", phone: "+977980000002", email: "legends@example.com", createdAt: now, notes: "Monthly corporate booking" }
  ];

  for (const customer of customers) {
    await prisma.customer.upsert({ where: { phone: customer.phone }, update: customer, create: customer });
  }

  const bookings = [
    {
      id: "booking_today_1",
      customerId: "cust_ram",
      customerName: "Ram FC",
      customerPhone: "+977980000001",
      courtId: "court_a",
      courtName: "Court A",
      date: today,
      startTime: "18:00",
      endTime: "19:00",
      durationMins: 60,
      price: 2500,
      amountPaid: 1500,
      paymentStatus: "partial",
      status: "pending_payment",
      notes: "Collect remaining balance before kick-off",
      createdBy: "admin_super_owner",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "booking_today_2",
      customerId: "cust_lalit",
      customerName: "Lalitpur Legends",
      customerPhone: "+977980000002",
      courtId: "court_b",
      courtName: "Court B",
      date: today,
      startTime: "20:00",
      endTime: "21:00",
      durationMins: 60,
      price: 2300,
      amountPaid: 2300,
      paymentStatus: "paid",
      status: "booked",
      notes: "",
      createdBy: "admin_staff_1",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "booking_tomorrow_1",
      customerId: "cust_ram",
      customerName: "Ram FC",
      customerPhone: "+977980000001",
      courtId: "court_a",
      courtName: "Court A",
      date: tomorrow,
      startTime: "07:00",
      endTime: "08:00",
      durationMins: 60,
      price: 1800,
      amountPaid: 0,
      paymentStatus: "unpaid",
      status: "booked",
      notes: "",
      createdBy: "admin_super_owner",
      createdAt: now,
      updatedAt: now
    }
  ];

  for (const booking of bookings) {
    await prisma.booking.upsert({ where: { id: booking.id }, update: booking, create: booking });
  }

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.setting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } });
  }

  await prisma.auditLog.upsert({
    where: { id: "audit_seed" },
    update: {
      actorId: "system",
      actorName: "Seed",
      action: "seed.database",
      entityType: "system",
      entityId: "database",
      details: "Verified secure Prisma PostgreSQL seed database",
      timestamp: now
    },
    create: {
      id: "audit_seed",
      actorId: "system",
      actorName: "Seed",
      action: "seed.database",
      entityType: "system",
      entityId: "database",
      details: "Created secure Prisma PostgreSQL seed database",
      timestamp: now
    }
  });
}
