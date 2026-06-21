import { addDays, format, parseISO, startOfWeek } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Booking, Court } from "@/types/domain";
import { StatusPill } from "./status-pill";

export function WeekScheduleGrid({ courts, bookings, date }: { courts: Court[]; bookings: Booking[]; date: string }) {
  const weekStart = startOfWeek(parseISO(date), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  return (
    <Card className="overflow-hidden">
      <div className="pitch-header border-b border-border p-4">
        <p className="font-display text-xl font-bold">Week schedule</p>
        <p className="text-sm text-muted-foreground tabular">{format(days[0], "MMM d")} - {format(days[6], "MMM d, yyyy")}</p>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="grid border-b border-border" style={{ gridTemplateColumns: "160px repeat(7, minmax(130px, 1fr))" }}>
            <div className="bg-muted/60 p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Court</div>
            {days.map((day) => <div key={day.toISOString()} className="border-l border-border bg-muted/60 p-3 text-sm font-semibold tabular">{format(day, "EEE d")}</div>)}
          </div>
          {courts.map((court) => (
            <div key={court.id} className="grid border-b border-border last:border-b-0" style={{ gridTemplateColumns: "160px repeat(7, minmax(130px, 1fr))" }}>
              <div className="p-3">
                <p className="font-semibold">{court.name}</p>
                <Badge variant={court.status === "active" ? "success" : "muted"}>{court.status}</Badge>
              </div>
              {days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const dayBookings = bookings.filter((booking) => booking.courtId === court.id && booking.date === key && booking.status !== "cancelled").sort((a, b) => a.startTime.localeCompare(b.startTime));
                return (
                  <div key={`${court.id}-${key}`} className="min-h-28 border-l border-border p-2">
                    {dayBookings.length ? (
                      <div className="space-y-2">
                        {dayBookings.map((booking) => (
                          <div key={booking.id} className="rounded-xl border border-border bg-background p-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-xs font-semibold">{booking.customerName}</span>
                              <StatusPill status={booking.status} compact />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground tabular">{booking.startTime}-{booking.endTime}</p>
                          </div>
                        ))}
                      </div>
                    ) : <span className="text-xs text-muted-foreground">Available</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
