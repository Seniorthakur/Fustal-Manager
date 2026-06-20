import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export function StatCard({ title, value, helper, icon: Icon, className }: { title: string; value: string | number; helper?: string; icon: LucideIcon; className?: string }) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 font-display text-3xl font-bold tabular">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      {helper ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{helper}</p> : null}
    </Card>
  );
}
