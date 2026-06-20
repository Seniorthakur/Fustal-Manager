export type Role = "super_admin" | "booking_admin";
export type AdminStatus = "active" | "inactive";
export type CourtStatus = "active" | "inactive" | "maintenance";
export type PaymentStatus = "unpaid" | "partial" | "paid";
export type BookingStatus = "booked" | "pending_payment" | "completed" | "cancelled" | "blocked";
export type CourtType = "indoor" | "outdoor";

export type Admin = {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  role: Role;
  status: AdminStatus;
  lastLoginAt: string;
  createdAt: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
  notes: string;
};

export type Court = {
  id: string;
  name: string;
  type: CourtType;
  openTime: string;
  closeTime: string;
  status: CourtStatus;
};

export type PricingRule = {
  id: string;
  courtId: string;
  dayOfWeek: string;
  startWindow: string;
  endWindow: string;
  isPeak: boolean;
  hourlyRate: number;
};

export type Booking = {
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
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type Setting = {
  key: string;
  value: string;
};

export type AuditLog = {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
};

export type BookingFilters = {
  date?: string;
  courtId?: string;
  status?: BookingStatus | "all";
  paymentStatus?: PaymentStatus | "all";
  createdBy?: string;
  search?: string;
};

export type ReportRow = Record<string, string | number>;
