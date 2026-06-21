"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth/require-session";
import { customersRepository } from "@/lib/repositories/customers-repository";
import { customerSchema } from "@/lib/validation/customer.schema";
import { writeAuditLog } from "@/lib/services/audit-service";
import { newId } from "@/lib/utils/ids";

export async function createCustomerAction(formData: FormData) {
  const user = await requirePermission("customers:create");
  const input = customerSchema.parse(Object.fromEntries(formData.entries()));
  const customer = await customersRepository.create({
    id: newId("cust"),
    name: input.name,
    phone: input.phone,
    email: input.email ?? "",
    notes: input.notes ?? "",
    createdAt: new Date().toISOString()
  });
  await writeAuditLog({
    actorId: user.id,
    actorName: user.name,
    action: "customer.create",
    entityType: "customer",
    entityId: customer.id,
    details: JSON.stringify({ name: customer.name, phone: customer.phone })
  });
  revalidatePath("/customers");
  redirect("/customers");
}

export async function updateCustomerAction(formData: FormData): Promise<void> {
  const user = await requirePermission("customers:update");
  const id = String(formData.get("id") ?? "");
  const input = customerSchema.parse(Object.fromEntries(formData.entries()));
  const customer = await customersRepository.update(id, { ...input, email: input.email ?? "", notes: input.notes ?? "" });
  await writeAuditLog({
    actorId: user.id,
    actorName: user.name,
    action: "customer.update",
    entityType: "customer",
    entityId: customer.id,
    details: JSON.stringify({ name: customer.name })
  });
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
}

export async function deleteCustomerAction(formData: FormData): Promise<void> {
  const user = await requirePermission("customers:delete");
  const id = String(formData.get("id") ?? "");
  const customer = await customersRepository.findById(id);
  if (!customer) throw new Error("Customer not found.");
  await customersRepository.delete(id);
  await writeAuditLog({
    actorId: user.id,
    actorName: user.name,
    action: "customer.delete",
    entityType: "customer",
    entityId: id,
    details: JSON.stringify({ name: customer.name, phone: customer.phone })
  });
  revalidatePath("/customers");
  revalidatePath("/bookings");
  revalidatePath("/schedule");
}
