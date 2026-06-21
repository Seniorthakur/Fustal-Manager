import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSettingsAction } from "@/server-actions/settings.actions";

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  return (
    <form action={updateSettingsAction} className="grid gap-4 md:grid-cols-2">
      <Field label="Facility name" name="facilityName" defaultValue={settings.facilityName} required />
      <Field label="Contact" name="contact" defaultValue={settings.contact} required />
      <Field label="Address" name="address" defaultValue={settings.address} required />
      <Field label="Currency" name="currency" defaultValue={settings.currency} maxLength={3} required />
      <Field label="Timezone" name="timezone" defaultValue={settings.timezone} required />
      <Field label="Default slot length" name="defaultSlotLengthMins" type="number" defaultValue={settings.defaultSlotLengthMins} required />
      <Field label="Default open time" name="defaultOpenTime" type="time" defaultValue={settings.defaultOpenTime} required />
      <Field label="Default close time" name="defaultCloseTime" type="time" defaultValue={settings.defaultCloseTime} required />
      <Button type="submit" className="md:col-span-2"><Save className="h-4 w-4" aria-hidden="true" /> Save settings</Button>
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
