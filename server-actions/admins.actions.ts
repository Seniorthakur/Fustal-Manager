"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/require-session";
import { adminsRepository } from "@/lib/repositories/admins-repository";
import { createAdminSchema, resetPasswordSchema } from "@/lib/validation/admin.schema";
import { generateTemporaryPassword, hashPassword } from "@/lib/auth/password";
import { writeAuditLog } from "@/lib/services/audit-service";
import { newId } from "@/lib/utils/ids";

export async function createBookingAdminAction(formData: FormData) {
  const user = await requirePermission("admins:create");
  const parsed = createAdminSchema.parse(Object.fromEntries(formData.entries()));
  const username = parsed.username.trim().toLowerCase();
  const existing = await adminsRepository.findByUsername(username);
  if (existing) throw new Error("Username is already taken.");
  const activeBookingAdmins = (await adminsRepository.list()).filter((admin) => admin.role === "booking_admin" && admin.status === "active").length;
  if (activeBookingAdmins >= 5) throw new Error("There are already 5 active Booking Admins. Deactivate one before adding another.");

  const temporaryPassword = parsed.temporaryPassword || generateTemporaryPassword();
  const admin = await adminsRepository.create({
    id: newId("admin"),
    name: parsed.name,
    username,
    passwordHash: await hashPassword(temporaryPassword),
    role: "booking_admin",
    status: "active",
    lastLoginAt: "",
    createdAt: new Date().toISOString()
  });

  await writeAuditLog({ actorId: user.id, actorName: user.name, action: "admin.create", entityType: "admin", entityId: admin.id, details: JSON.stringify({ username }) });
  revalidatePath("/admins");
  return { username, temporaryPassword };
}

export async function setAdminStatusAction(formData: FormData) {
  const user = await requirePermission("admins:deactivate");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "inactive") as "active" | "inactive";
  const admin = await adminsRepository.setStatus(id, status);
  await writeAuditLog({ actorId: user.id, actorName: user.name, action: `admin.${status}`, entityType: "admin", entityId: id, details: JSON.stringify({ username: admin.username }) });
  revalidatePath("/admins");
}

export async function resetAdminPasswordAction(formData: FormData) {
  const user = await requirePermission("admins:reset_password");
  const parsed = resetPasswordSchema.parse(Object.fromEntries(formData.entries()));
  await adminsRepository.update(parsed.adminId, { passwordHash: await hashPassword(parsed.temporaryPassword) });
  await writeAuditLog({ actorId: user.id, actorName: user.name, action: "admin.reset_password", entityType: "admin", entityId: parsed.adminId, details: "Temporary password reset" });
  revalidatePath("/admins");
}

export async function deleteAdminAction(formData: FormData) {
  const user = await requirePermission("admins:update");
  const id = String(formData.get("id") ?? "");
  await adminsRepository.delete(id);
  await writeAuditLog({ actorId: user.id, actorName: user.name, action: "admin.delete", entityType: "admin", entityId: id, details: "Deleted admin row" });
  revalidatePath("/admins");
}

export type AdminCreateState = { ok: boolean; message: string; username?: string; temporaryPassword?: string };

export async function createBookingAdminStateAction(_state: AdminCreateState, formData: FormData): Promise<AdminCreateState> {
  try {
    const result = await createBookingAdminAction(formData);
    return { ok: true, message: "Booking Admin created. Copy the temporary password now; it is not stored in plain text.", ...result };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not create Booking Admin." };
  }
}
