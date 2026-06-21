import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCustomerAction } from "@/server-actions/customers.actions";

export function CustomerForm() {
  return (
    <form action={createCustomerAction} className="grid gap-4 lg:grid-cols-2">
      <Field label="Name" name="name" required />
      <Field label="Phone" name="phone" required />
      <Field label="Email" name="email" type="email" />
      <div className="space-y-2 lg:col-span-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" placeholder="Preferred slot, team details, or payment notes" />
      </div>
      <Button type="submit" className="lg:col-span-2"><UserPlus className="h-4 w-4" aria-hidden="true" /> Add customer</Button>
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
