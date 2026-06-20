import type { Role } from "@/types/domain";

export const permissions = {
  "dashboard:view": ["super_admin", "booking_admin"],
  "bookings:view": ["super_admin", "booking_admin"],
  "bookings:create": ["super_admin", "booking_admin"],
  "bookings:update": ["super_admin", "booking_admin"],
  "bookings:cancel": ["super_admin", "booking_admin"],
  "bookings:mark_paid": ["super_admin", "booking_admin"],
  "bookings:delete": ["super_admin", "booking_admin"],
  "customers:view": ["super_admin", "booking_admin"],
  "customers:create": ["super_admin", "booking_admin"],
  "customers:update": ["super_admin", "booking_admin"],
  "customers:delete": ["super_admin", "booking_admin"],
  "courts:view": ["super_admin", "booking_admin"],
  "courts:manage": ["super_admin"],
  "pricing:view": ["super_admin", "booking_admin"],
  "pricing:manage": ["super_admin"],
  "admins:view": ["super_admin"],
  "admins:create": ["super_admin"],
  "admins:update": ["super_admin"],
  "admins:deactivate": ["super_admin"],
  "admins:reset_password": ["super_admin"],
  "reports:view": ["super_admin", "booking_admin"],
  "settings:view": ["super_admin"],
  "settings:update": ["super_admin"],
  "audit_log:view": ["super_admin"]
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof permissions;

export function hasPermission(role: Role | undefined, permission: Permission) {
  if (!role) return false;
  return permissions[permission].includes(role);
}
