import { BadgeCheck, Ban, CheckCircle2, Circle, Clock3, XCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { BookingStatus } from "@/types/domain";

export type ScheduleStatus = BookingStatus | "available";

const config = {
  available: { label: "Available", Icon: Circle, className: "bg-status-available text-muted-foreground border-border" },
  booked: { label: "Booked", Icon: CheckCircle2, className: "bg-status-booked text-brand-foreground border-status-booked" },
  pending_payment: { label: "Pending", Icon: Clock3, className: "bg-status-pending/18 text-amber-800 border-status-pending dark:text-amber-100" },
  completed: { label: "Completed", Icon: BadgeCheck, className: "bg-status-completed/18 text-blue-800 border-status-completed dark:text-blue-100" },
  cancelled: { label: "Cancelled", Icon: XCircle, className: "bg-status-cancelled/16 text-rose-800 border-status-cancelled dark:text-rose-100" },
  blocked: { label: "Blocked", Icon: Ban, className: "hatched bg-status-blocked/12 text-muted-foreground border-status-blocked" }
} as const;

export function StatusPill({ status, compact = false }: { status: ScheduleStatus; compact?: boolean }) {
  const item = config[status];
  const Icon = item.Icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-semibold", item.className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {compact ? item.label.split(" ")[0] : item.label}
    </span>
  );
}
