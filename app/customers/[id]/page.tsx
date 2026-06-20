import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { customersRepository } from "@/lib/repositories/customers-repository";
import { bookingsRepository } from "@/lib/repositories/bookings-repository";
import { settingsRepository } from "@/lib/repositories/settings-repository";
import { formatCurrency } from "@/lib/utils/money";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [customer, bookings, settings] = await Promise.all([customersRepository.findById(id), bookingsRepository.byCustomer(id), settingsRepository.map()]);
  if (!customer) notFound();
  const paid = bookings.reduce((sum, booking) => sum + booking.amountPaid, 0);
  const outstanding = bookings.reduce((sum, booking) => sum + Math.max(booking.price - booking.amountPaid, 0), 0);

  return (
    <AppShell>
      <PageHeader title={customer.name} description={`${customer.phone} / ${customer.email || "No email saved"}`} action={<Button asChild variant="secondary"><Link href="/customers">Back</Link></Button>} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Total bookings</CardTitle></CardHeader><CardContent className="font-display text-3xl font-bold tabular">{bookings.length}</CardContent></Card>
        <Card><CardHeader><CardTitle>Paid</CardTitle></CardHeader><CardContent className="font-display text-3xl font-bold tabular">{formatCurrency(paid, settings.currency)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Outstanding</CardTitle></CardHeader><CardContent className="font-display text-3xl font-bold tabular">{formatCurrency(outstanding, settings.currency)}</CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Booking history</CardTitle><CardDescription>Full history for this customer.</CardDescription></CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <Table>
              <TableHeader><TableRow><TableHead>Date/time</TableHead><TableHead>Court</TableHead><TableHead>Status</TableHead><TableHead>Payment</TableHead></TableRow></TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="tabular">{booking.date} / {booking.startTime}-{booking.endTime}</TableCell>
                    <TableCell>{booking.courtName}</TableCell>
                    <TableCell><Badge variant="outline">{booking.status.replace("_", " ")}</Badge></TableCell>
                    <TableCell className="tabular">{formatCurrency(booking.amountPaid, settings.currency)} / {formatCurrency(booking.price, settings.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
