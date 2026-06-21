import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createCourtAction, createPricingRuleAction } from "@/server-actions/courts.actions";
import type { Court } from "@/types/domain";

export function CreateCourtForm() {
  return (
    <form action={createCourtAction} className="grid gap-4 md:grid-cols-2">
      <Field label="Court name" name="name" required />
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select id="type" name="type" defaultValue="indoor"><option value="indoor">Indoor</option><option value="outdoor">Outdoor</option></Select>
      </div>
      <Field label="Open time" name="openTime" type="time" defaultValue="06:00" required />
      <Field label="Close time" name="closeTime" type="time" defaultValue="22:00" required />
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="status">Status</Label>
        <Select id="status" name="status" defaultValue="active"><option value="active">Active</option><option value="inactive">Inactive</option><option value="maintenance">Maintenance</option></Select>
      </div>
      <Button type="submit" className="md:col-span-2"><Plus className="h-4 w-4" aria-hidden="true" /> Create court</Button>
    </form>
  );
}

export function CreatePricingRuleForm({ courts }: { courts: Court[] }) {
  return (
    <form action={createPricingRuleAction} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="courtId">Court</Label>
        <Select id="courtId" name="courtId" defaultValue="all"><option value="all">All courts</option>{courts.map((court) => <option key={court.id} value={court.id}>{court.name}</option>)}</Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dayOfWeek">Day</Label>
        <Select id="dayOfWeek" name="dayOfWeek" defaultValue="weekday"><option value="weekday">Weekday</option><option value="weekend">Weekend</option><option value="monday">Monday</option><option value="tuesday">Tuesday</option><option value="wednesday">Wednesday</option><option value="thursday">Thursday</option><option value="friday">Friday</option><option value="saturday">Saturday</option><option value="sunday">Sunday</option></Select>
      </div>
      <Field label="Start window" name="startWindow" type="time" defaultValue="17:00" required />
      <Field label="End window" name="endWindow" type="time" defaultValue="22:00" required />
      <Field label="Hourly rate" name="hourlyRate" type="number" defaultValue="2500" required />
      <label className="flex min-h-11 items-center gap-3 rounded-xl border border-border px-3 text-sm font-medium">
        <input type="checkbox" name="isPeak" className="h-4 w-4 rounded border-border" /> Peak rule
      </label>
      <Button type="submit" className="md:col-span-2"><Plus className="h-4 w-4" aria-hidden="true" /> Add pricing rule</Button>
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
