"use client";

import { useActionState } from "react";
import { ShieldPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBookingAdminStateAction, type AdminCreateState } from "@/server-actions/admins.actions";

const initialState: AdminCreateState = { ok: false, message: "" };

export function CreateAdminForm() {
  const [state, action, pending] = useActionState(createBookingAdminStateAction, initialState);
  return (
    <form action={action} className="space-y-4">
      <Field label="Name" name="name" required />
      <Field label="Username" name="username" required />
      <Field label="Temporary password" name="temporaryPassword" placeholder="Leave blank to auto-generate" />
      {state.message ? (
        <div className={state.ok ? "rounded-xl bg-brand/10 p-3 text-sm text-brand" : "rounded-xl bg-destructive/10 p-3 text-sm text-destructive"} role="status">
          <p className="font-semibold">{state.message}</p>
          {state.ok ? <p className="mt-2 tabular">{state.username} / {state.temporaryPassword}</p> : null}
        </div>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full"><ShieldPlus className="h-4 w-4" aria-hidden="true" /> {pending ? "Creating..." : "Create Booking Admin"}</Button>
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
