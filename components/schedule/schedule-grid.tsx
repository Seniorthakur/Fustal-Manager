"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, CircleDollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CustomerPickerFields } from "@/components/bookings/customer-picker-fields";
import { createBookingAction, cancelBookingAction, markBookingPaidAction } from "@/server-actions/bookings.actions";
import { generateSlots, isToday, toMinutes } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";
import type { Booking, Court, Customer } from "@/types/domain";
import { StatusPill } from "./status-pill";

function findBooking(bookings: Booking[], courtId: string, slot: string) {
  const minute = toMinutes(slot);
  return bookings.find((booking) => booking.courtId === courtId && minute >= toMinutes(booking.startTime) && minute < toMinutes(booking.endTime) && booking.status !== "cancelled");
}

function isBookingStart(booking: Booking | undefined, slot: string) {
  return booking?.startTime === slot;
}

type DrawerState =
  | { type: "new"; court: Court; slot: string }
  | { type: "booking"; booking: Booking }
  | null;

type ScheduleGridProps = {
  courts: Court[];
  bookings: Booking[];
  customers: Customer[];
  date: string;
  slotLengthMins: number;
};

export function ScheduleGrid({ courts, bookings, customers, date, slotLengthMins }: ScheduleGridProps) {
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const open = courts.length ? courts.reduce((min, court) => (toMinutes(court.openTime) < toMinutes(min) ? court.openTime : min), courts[0].openTime) : "06:00";
  const close = courts.length ? courts.reduce((max, court) => (toMinutes(court.closeTime) > toMinutes(max) ? court.closeTime : max), courts[0].closeTime) : "22:00";
  const slots = useMemo(() => generateSlots(open, close, slotLengthMins), [open, close, slotLengthMins]);
  const currentMinute = toMinutes(new Date().toTimeString().slice(0, 5));

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="pitch-header border-b border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-xl font-bold">Day schedule</p>
            <p className="text-sm text-muted-foreground tabular">{date} / {slotLengthMins}-minute slots</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill status="available" />
            <StatusPill status="booked" />
            <StatusPill status="pending_payment" />
            <StatusPill status="completed" />
            <StatusPill status="blocked" />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[860px]">
          <div className="grid border-b border-border" style={{ gridTemplateColumns: `96px repeat(${courts.length}, minmax(180px, 1fr))` }}>
            <div className="bg-muted/60 p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Time</div>
            {courts.map((court) => (
              <div key={court.id} className="border-l border-border bg-muted/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{court.name}</span>
                  <Badge variant={court.status === "active" ? "success" : "muted"}>{court.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground tabular">{court.openTime}-{court.closeTime}</p>
              </div>
            ))}
          </div>
          {slots.map((slot) => (
            <div key={slot} className={cn("relative grid min-h-16 border-b border-border last:border-b-0", isToday(date) && currentMinute >= toMinutes(slot) && currentMinute < toMinutes(slot) + slotLengthMins ? "bg-brand/5" : "")} style={{ gridTemplateColumns: `96px repeat(${courts.length}, minmax(180px, 1fr))` }}>
              <div className="flex items-start justify-end bg-muted/20 px-3 py-3 text-sm font-medium text-muted-foreground tabular">{slot}</div>
              {courts.map((court) => {
                const booking = findBooking(bookings, court.id, slot);
                const atStart = isBookingStart(booking, slot);
                const disabled = court.status !== "active";
                return (
                  <div key={`${court.id}-${slot}`} className="border-l border-border p-2">
                    {booking && atStart ? (
                      <button
                        type="button"
                        onClick={() => setDrawer({ type: "booking", booking })}
                        className={cn(
                          "flex min-h-12 w-full flex-col items-start justify-center rounded-xl border p-3 text-left transition hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-ring",
                          booking.status === "booked" && "border-status-booked bg-status-booked text-brand-foreground",
                          booking.status === "pending_payment" && "border-status-pending bg-status-pending/16 text-foreground",
                          booking.status === "completed" && "border-status-completed bg-status-completed/16 text-foreground",
                          booking.status === "blocked" && "hatched border-status-blocked bg-status-blocked/12 text-foreground"
                        )}
                      >
                        <span className="flex w-full items-center justify-between gap-2">
                          <span className="font-semibold">{booking.customerName}</span>
                          <StatusPill status={booking.status} compact />
                        </span>
                        <span className="mt-1 text-xs tabular opacity-90">{booking.startTime}-{booking.endTime} / {booking.paymentStatus}</span>
                      </button>
                    ) : booking ? (
                      <div className="min-h-12 rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">Continues...</div>
                    ) : (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => setDrawer({ type: "new", court, slot })}
                        className="flex min-h-12 w-full items-center justify-center rounded-xl border border-dashed border-border bg-status-available text-xs font-medium text-muted-foreground transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {disabled ? court.status : "Available"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {drawer ? <ScheduleDrawer drawer={drawer} date={date} customers={customers} onClose={() => setDrawer(null)} /> : null}
    </div>
  );
}

function ScheduleDrawer({ drawer, date, customers, onClose }: { drawer: NonNullable<DrawerState>; date: string; customers: Customer[]; onClose: () => void }) {
  const [closing, setClosing] = useState(false);

  function closeWithAnimation(delay = 180) {
    setClosing(true);
    window.setTimeout(onClose, delay);
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none",
        closing ? "opacity-0" : "opacity-100"
      )}
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) closeWithAnimation();
      }}
    >
      <div
        className={cn(
          "ml-auto flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-border bg-card shadow-soft transition-transform duration-200 ease-out motion-reduce:transition-none",
          closing ? "translate-x-full" : "translate-x-0"
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 p-5 backdrop-blur">
          <div>
            <p className="font-display text-xl font-bold">{drawer.type === "new" ? "New booking" : "Booking details"}</p>
            <p className="text-sm text-muted-foreground">{drawer.type === "new" ? `${drawer.court.name} at ${drawer.slot}` : drawer.booking.customerName}</p>
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label="Close drawer" onClick={() => closeWithAnimation()}>
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
        <div className="p-5">
          {drawer.type === "new" ? (
            <NewBookingFromSlot court={drawer.court} date={date} slot={drawer.slot} customers={customers} />
          ) : (
            <BookingDetail booking={drawer.booking} onCancelled={() => closeWithAnimation(220)} />
          )}
        </div>
      </div>
    </div>
  );
}

function NewBookingFromSlot({ court, date, slot, customers }: { court: Court; date: string; slot: string; customers: Customer[] }) {
  return (
    <form action={createBookingAction} className="space-y-4">
      <input type="hidden" name="courtId" value={court.id} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="startTime" value={slot} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <CustomerPickerFields customers={customers} className="grid gap-4 sm:grid-cols-2" />
        </div>
        <Field label="Duration (mins)" name="durationMins" type="number" defaultValue="60" required />
        <Field label="Price override" name="price" type="number" defaultValue="0" />
        <Field label="Amount paid" name="amountPaid" type="number" defaultValue="0" />
        <div className="space-y-2">
          <Label htmlFor="paymentStatus">Payment status</Label>
          <Select id="paymentStatus" name="paymentStatus" defaultValue="unpaid">
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="status">Booking status</Label>
          <Select id="status" name="status" defaultValue="booked">
            <option value="booked">Booked</option>
            <option value="pending_payment">Pending payment</option>
            <option value="blocked">Blocked / maintenance</option>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" placeholder="Internal notes" />
      </div>
      <Button type="submit" className="w-full"><CalendarPlus className="h-4 w-4" aria-hidden="true" /> Create booking</Button>
    </form>
  );
}

function BookingDetail({ booking, onCancelled }: { booking: Booking; onCancelled: () => void }) {
  const [cancelState, setCancelState] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [cancelError, setCancelError] = useState("");

  async function cancelWithFeedback(formData: FormData) {
    setCancelState("pending");
    setCancelError("");
    try {
      await cancelBookingAction(formData);
      setCancelState("success");
      window.setTimeout(onCancelled, 650);
    } catch (error) {
      setCancelState("error");
      setCancelError(error instanceof Error ? error.message : "Could not cancel booking.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-background p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{booking.customerName}</p>
            <p className="text-sm text-muted-foreground tabular">{booking.customerPhone}</p>
          </div>
          <StatusPill status={booking.status} />
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted-foreground">Court</dt><dd className="font-medium">{booking.courtName}</dd></div>
          <div><dt className="text-muted-foreground">Time</dt><dd className="font-medium tabular">{booking.date} / {booking.startTime}-{booking.endTime}</dd></div>
          <div><dt className="text-muted-foreground">Payment</dt><dd className="font-medium capitalize">{booking.paymentStatus}</dd></div>
          <div><dt className="text-muted-foreground">Amount</dt><dd className="font-medium tabular">{booking.amountPaid} / {booking.price}</dd></div>
        </dl>
      </div>

      <form action={markBookingPaidAction} className="rounded-2xl border border-border bg-background p-4">
        <input type="hidden" name="id" value={booking.id} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="amountPaid">Amount paid</Label>
            <Input id="amountPaid" name="amountPaid" type="number" defaultValue={booking.price} />
          </div>
          <Button type="submit"><CircleDollarSign className="h-4 w-4" aria-hidden="true" /> Mark paid</Button>
        </div>
      </form>

      <form action={cancelWithFeedback} className="rounded-2xl border border-border bg-background p-4">
        <input type="hidden" name="id" value={booking.id} />
        <div className="space-y-2">
          <Label htmlFor="reason">Cancellation note</Label>
          <Textarea id="reason" name="reason" defaultValue={booking.notes} />
        </div>
        {cancelState !== "idle" ? (
          <div className={cn(
            "mt-3 rounded-xl border p-3 text-sm transition-opacity duration-200",
            cancelState === "success" && "border-brand bg-brand/10 text-brand motion-safe:animate-pulse",
            cancelState === "pending" && "border-status-pending bg-status-pending/10 text-amber-900 dark:text-amber-100",
            cancelState === "error" && "border-destructive bg-destructive/10 text-destructive"
          )} role="status" aria-live="polite">
            {cancelState === "pending" ? "Cancelling booking..." : null}
            {cancelState === "success" ? "Booking cancelled. Closing details..." : null}
            {cancelState === "error" ? cancelError : null}
          </div>
        ) : null}
        <Button type="submit" variant="destructive" className="mt-3" disabled={cancelState === "pending" || cancelState === "success"}>Cancel booking</Button>
      </form>
    </div>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  const { label, name, ...inputProps } = props;
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...inputProps} />
    </div>
  );
}
