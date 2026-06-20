import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "success" | "warning" | "info" | "danger" | "muted" | "outline";

const classes: Record<BadgeVariant, string> = {
  default: "bg-brand/12 text-brand ring-brand/20",
  success: "bg-status-booked/14 text-brand ring-brand/20",
  warning: "bg-status-pending/15 text-amber-700 ring-status-pending/25 dark:text-amber-200",
  info: "bg-status-completed/15 text-blue-700 ring-status-completed/25 dark:text-blue-200",
  danger: "bg-status-cancelled/15 text-rose-700 ring-status-cancelled/25 dark:text-rose-200",
  muted: "bg-muted text-muted-foreground ring-border",
  outline: "bg-transparent text-foreground ring-border"
};

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn("inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-semibold ring-1 tabular", classes[variant], className)}
      {...props}
    />
  );
}
