import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CustomerPickerFields } from "@/components/bookings/customer-picker-fields";
import { createBookingAction } from "@/server-actions/bookings.actions";
import { todayISO } from "@/lib/utils/dates";
import type { Court, Customer } from "@/types/domain";

export function NewBookingForm({ courts, customers }: { courts: Court[]; customers: Customer[] }) {
  return (
    <form action={createBookingAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <CustomerPickerFields customers={customers} />
      <div className="space-y-2">
        <Label htmlFor="courtId">Court</Label>
        <Select id="courtId" name="courtId" required>
          {courts.filter((court) => court.status === "active").map((court) => <option key={court.id} value={court.id}>{court.name}</option>)}
        </Select>
      </div>
      <Field label="Date" name="date" type="date" defaultValue={todayISO()} required />
      <Field label="Start time" name="startTime" type="time" defaultValue="18:00" required />
      <Field label="Duration minutes" name="durationMins" type="number" defaultValue="60" min="30" max="240" required />
      <Field label="Price override (0 = auto)" name="price" type="number" defaultValue="0" min="0" />
      <Field label="Amount paid" name="amountPaid" type="number" defaultValue="0" min="0" />
      <div className="space-y-2">
        <Label htmlFor="paymentStatus">Payment status</Label>
        <Select id="paymentStatus" name="paymentStatus" defaultValue="unpaid">
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Booking status</Label>
        <Select id="status" name="status" defaultValue="booked">
          <option value="booked">Booked</option>
          <option value="pending_payment">Pending payment</option>
          <option value="completed">Completed</option>
          <option value="blocked">Blocked / maintenance</option>
        </Select>
      </div>
      <div className="space-y-2 md:col-span-2 xl:col-span-3">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" placeholder="Payment note, team preference, or internal instruction" />
      </div>
      <Button type="submit" className="md:col-span-2 xl:col-span-3"><CalendarPlus className="h-4 w-4" aria-hidden="true" /> Create booking</Button>
    </form>
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
