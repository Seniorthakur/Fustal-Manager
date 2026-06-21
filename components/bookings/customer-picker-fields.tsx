"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Customer } from "@/types/domain";

type CustomerPickerFieldsProps = {
  customers: Customer[];
  className?: string;
};

export function CustomerPickerFields({ customers, className }: CustomerPickerFieldsProps) {
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const sortedCustomers = useMemo(
    () => [...customers].sort((a, b) => a.name.localeCompare(b.name)),
    [customers]
  );

  function handleSelect(value: string) {
    setSelectedId(value);
    const selected = sortedCustomers.find((customer) => customer.id === value);
    setName(selected?.name ?? "");
    setPhone(selected?.phone ?? "");
  }

  return (
    <div className={className ?? "contents"}>
      <input type="hidden" name="customerId" value={selectedId} />
      <div className="space-y-2">
        <Label htmlFor="customerPicker">Existing customer</Label>
        <Select
          id="customerPicker"
          value={selectedId}
          onChange={(event) => handleSelect(event.target.value)}
        >
          <option value="">New customer or match by phone</option>
          {sortedCustomers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} / {customer.phone}
            </option>
          ))}
        </Select>
        <p className="text-xs leading-5 text-muted-foreground">
          Selecting a customer auto-fills the booking name and phone on both Bookings and Schedule.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="customerName">Customer name</Label>
        <Input
          id="customerName"
          name="customerName"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customerPhone">Customer phone</Label>
        <Input
          id="customerPhone"
          name="customerPhone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
        />
      </div>
    </div>
  );
}
