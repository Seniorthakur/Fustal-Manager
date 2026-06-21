import Link from "next/link";
import { CalendarCheck, CircleDollarSign, Clock3, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { getDashboardMetrics, bookingsPerDay, occupancyByCourt } from "@/lib/services/reports-service";
import { formatCurrency } from "@/lib/utils/money";

export default async function DashboardPage() {
  const [metrics, daily, occupancy] = await Promise.all([getDashboardMetrics(), bookingsPerDay(7), occupancyByCourt()]);

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Today at a glance: court load, cash collected, outstanding balance, and the next bookings coming up."
        action={<Button asChild><Link href="/bookings#new-booking">New booking</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Bookings today" value={metrics.totalBookingsToday} helper="Active bookings, excluding cancellations." icon={CalendarCheck} />
        <StatCard title="Occupancy" value={`${metrics.occupancy}%`} helper="Estimated against active court hours." icon={TrendingUp} />
        <StatCard title="Collected" value={formatCurrency(metrics.revenueCollected)} helper="Amount paid across active bookings." icon={CircleDollarSign} />
        <StatCard title="Outstanding" value={formatCurrency(metrics.outstanding)} helper="Balance still due from customers." icon={Clock3} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <DashboardCharts daily={daily} occupancy={occupancy} />
        <Card>
          <CardHeader>
            <CardTitle>Next upcoming bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.nextBookings.length ? (
              <div className="space-y-3">
                {metrics.nextBookings.map((booking) => (
                  <Link key={booking.id} href="/schedule" className="block rounded-xl border border-border p-3 transition hover:bg-muted">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{booking.customerName}</p>
                      <Badge variant={booking.paymentStatus === "paid" ? "success" : booking.paymentStatus === "partial" ? "warning" : "muted"}>{booking.paymentStatus}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground tabular">{booking.date} / {booking.startTime}-{booking.endTime} / {booking.courtName}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <p className="font-semibold">No upcoming bookings yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Create a booking to populate the live schedule and reports.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
