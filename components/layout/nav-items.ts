import { BarChart3, CalendarDays, ClipboardList, Cog, LayoutDashboard, ShieldCheck, Users, WalletCards } from "lucide-react";
import type { Role } from "@/types/domain";

export const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "booking_admin"] },
  { href: "/schedule", label: "Schedule", icon: CalendarDays, roles: ["super_admin", "booking_admin"] },
  { href: "/bookings", label: "Bookings", icon: ClipboardList, roles: ["super_admin", "booking_admin"] },
  { href: "/customers", label: "Customers", icon: Users, roles: ["super_admin", "booking_admin"] },
  { href: "/courts", label: "Courts & Pricing", icon: WalletCards, roles: ["super_admin", "booking_admin"] },
  { href: "/admins", label: "Admins", icon: ShieldCheck, roles: ["super_admin"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["super_admin", "booking_admin"] },
  { href: "/settings", label: "Settings", icon: Cog, roles: ["super_admin"] }
] as const satisfies ReadonlyArray<{ href: string; label: string; icon: React.ComponentType<{ className?: string }>; roles: Role[] }>;
