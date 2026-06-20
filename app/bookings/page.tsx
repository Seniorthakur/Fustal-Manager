import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BookingTable } from "@/components/bookings/booking-table";
import { NewBookingForm } from "@/components/bookings/new-booking-form";
import { bookingsRepository } from "@/lib/repositories/bookings-repository";
import { courtsRepository } from "@/lib/repositories/courts-repository";
import { customersRepository } from "@/lib/repositories/customers-repository";
import { settingsRepository } from "@/lib/repositories/settings-repository";
import type { BookingStatus, PaymentStatus } from "@/types/domain";

export default async function BookingsPage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  const params = (await searchParams) ?? {};
  const [courts, customers, settings] = await Promise.all([courtsRepository.list(), customersRepository.list(), settingsRepository.map()]);
  const bookings = await bookingsRepository.list({
    date: params.date,
    courtId: params.courtId,
    status: (params.status as BookingStatus | "all" | undefined) ?? "all",
    paymentStatus: (params.paymentStatus as PaymentStatus | "all" | undefined) ?? "all",
    search: params.search
  });

  return (
    <AppShell>
      <PageHeader title="Bookings" description="Create, search, filter, cancel, and record payment on internal bookings. Double-booking prevention is enforced server-side." />
      <Card>
        <CardContent className="pt-5">
          <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" action="/bookings">
            <Input name="search" placeholder="Search customer or phone" defaultValue={params.search ?? ""} />
            <Input type="date" name="date" defaultValue={params.date ?? ""} aria-label="Filter date" />
            <Select name="courtId" defaultValue={params.courtId ?? ""} aria-label="Filter court">
              <option value="">All courts</option>
              {courts.map((court) => <option key={court.id} value={court.id}>{court.name}</option>)}
            </Select>
            <Select name="status" defaultValue={params.status ?? "all"} aria-label="Filter status">
              <option value="all">All statuses</option>
              <option value="booked">Booked</option>
              <option value="pending_payment">Pending payment</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="blocked">Blocked</option>
            </Select>
            <Button type="submit" variant="secondary">Filter</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Booking list</CardTitle>
          <CardDescription>{bookings.length} rows currently shown.</CardDescription>
        </CardHeader>
        <CardContent>
          <BookingTable bookings={bookings} currency={settings.currency} />
        </CardContent>
      </Card>
      <Card id="new-booking">
        <CardHeader>
          <CardTitle>New booking</CardTitle>
          <CardDescription>Price can be left at 0 to auto-calculate from pricing rules. A missing customer is created or matched by phone.</CardDescription>
        </CardHeader>
        <CardContent>
          <NewBookingForm courts={courts} customers={customers} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
