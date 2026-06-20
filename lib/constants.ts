export const ACTIVE_BOOKING_STATUSES = ["booked", "pending_payment", "completed", "blocked"] as const;

export const STATUS_LABELS = {
  available: "Available",
  booked: "Booked",
  pending_payment: "Pending payment",
  completed: "Completed",
  cancelled: "Cancelled",
  blocked: "Blocked"
} as const;

export const STATUS_ICONS = {
  available: "circle",
  booked: "check-circle",
  pending_payment: "clock",
  completed: "badge-check",
  cancelled: "x-circle",
  blocked: "ban"
} as const;

export const DEFAULT_SETTINGS = {
  facilityName: "Greenline Futsal",
  address: "Kathmandu",
  contact: "+977 9800000000",
  currency: "NPR",
  timezone: "Asia/Kathmandu",
  defaultSlotLengthMins: "60",
  defaultOpenTime: "06:00",
  defaultCloseTime: "22:00"
};
