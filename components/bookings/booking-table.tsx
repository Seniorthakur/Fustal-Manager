import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cancelBookingAction, deleteBookingAction, markBookingPaidAction } from "@/server-actions/bookings.actions";
import { formatCurrency } from "@/lib/utils/money";
import type { Booking } from "@/types/domain";

function statusVariant(status: Booking["status"]) {
  if (status === "booked") return "success" as const;
  if (status === "pending_payment") return "warning" as const;
  if (status === "completed") return "info" as const;
  if (status === "cancelled") return "danger" as const;
  return "muted" as const;
}

export function BookingTable({ bookings, currency }: { bookings: Booking[]; currency: string }) {
  if (!bookings.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="font-semibold">No bookings match this view</p>
        <p className="mt-1 text-sm text-muted-foreground">Try clearing filters or create a new booking below.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <Table className="min-w-[920px]">
        <TableHeader>
          <TableRow>
            <TableHead>Date/time</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Court</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="tabular">
                <div className="font-medium">{booking.date}</div>
                <div className="text-xs text-muted-foreground">{booking.startTime}-{booking.endTime}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{booking.customerName}</div>
                <div className="text-xs text-muted-foreground tabular">{booking.customerPhone}</div>
              </TableCell>
              <TableCell>{booking.courtName}</TableCell>
              <TableCell><Badge variant={statusVariant(booking.status)}>{booking.status.replace("_", " ")}</Badge></TableCell>
              <TableCell>
                <div className="capitalize">{booking.paymentStatus}</div>
                <div className="text-xs text-muted-foreground tabular">{formatCurrency(booking.amountPaid, currency)} / {formatCurrency(booking.price, currency)}</div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap justify-end gap-2">
                  {booking.status !== "cancelled" ? (
                    <form action={markBookingPaidAction}>
                      <input type="hidden" name="id" value={booking.id} />
                      <Input type="hidden" name="amountPaid" value={booking.price} readOnly />
                      <Button type="submit" variant="secondary" size="sm">Mark paid</Button>
                    </form>
                  ) : null}
                  {booking.status !== "cancelled" ? (
                    <form action={cancelBookingAction}>
                      <input type="hidden" name="id" value={booking.id} />
                      <input type="hidden" name="reason" value="Cancelled from bookings table" />
                      <Button type="submit" variant="destructive" size="sm">Cancel</Button>
                    </form>
                  ) : null}
                  <form action={deleteBookingAction}>
                    <input type="hidden" name="id" value={booking.id} />
                    <Button type="submit" variant="ghost" size="sm" aria-label={`Delete booking for ${booking.customerName}`}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Delete
                    </Button>
                  </form>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
