import { format } from "date-fns";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScheduleGrid } from "@/components/schedule/schedule-grid";
import { WeekScheduleGrid } from "@/components/schedule/week-schedule";
import { bookingsRepository } from "@/lib/repositories/bookings-repository";
import { courtsRepository } from "@/lib/repositories/courts-repository";
import { settingsRepository } from "@/lib/repositories/settings-repository";
import { customersRepository } from "@/lib/repositories/customers-repository";

export default async function SchedulePage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  const params = (await searchParams) ?? {};
  const date = params.date || format(new Date(), "yyyy-MM-dd");
  const selectedCourt = params.courtId || "";
  const selectedStatus = params.status || "all";
  const view = params.view || "day";
  const [courts, settings, allBookings, customers] = await Promise.all([courtsRepository.list(), settingsRepository.map(), bookingsRepository.list(), customersRepository.list()]);
  const rawBookings = view === "day" ? allBookings.filter((booking) => booking.date === date) : allBookings;
  const bookings = rawBookings.filter((booking) => (!selectedCourt || booking.courtId === selectedCourt) && (selectedStatus === "all" || booking.status === selectedStatus));
  const displayCourts = selectedCourt ? courts.filter((court) => court.id === selectedCourt) : courts;
  const slotLengthMins = Number(settings.defaultSlotLengthMins || 60);

  return (
    <AppShell>
      <PageHeader title="Schedule" description="Day and week-ready court grid. Empty cells create bookings; booked cells open operational actions." />
      <Card>
        <CardContent className="pt-5">
          <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[160px_180px_1fr_1fr_auto]" action="/schedule">
            <Select name="view" defaultValue={view} aria-label="Schedule view">
              <option value="day">Day view</option>
              <option value="week">Week view</option>
            </Select>
            <Input type="date" name="date" defaultValue={date} aria-label="Schedule date" />
            <Select name="courtId" defaultValue={selectedCourt} aria-label="Filter by court">
              <option value="">All courts</option>
              {courts.map((court) => <option key={court.id} value={court.id}>{court.name}</option>)}
            </Select>
            <Select name="status" defaultValue={selectedStatus} aria-label="Filter by status">
              <option value="all">All statuses</option>
              <option value="booked">Booked</option>
              <option value="pending_payment">Pending payment</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </Select>
            <Button type="submit" variant="secondary">Apply filters</Button>
          </form>
        </CardContent>
      </Card>
      {view === "week" ? <WeekScheduleGrid courts={displayCourts} bookings={bookings} date={date} /> : <ScheduleGrid courts={displayCourts} bookings={bookings} customers={customers} date={date} slotLengthMins={slotLengthMins} />}
    </AppShell>
  );
}
