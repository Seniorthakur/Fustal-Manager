"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/require-session";
import { courtsRepository } from "@/lib/repositories/courts-repository";
import { pricingRepository } from "@/lib/repositories/pricing-repository";
import { courtSchema, pricingRuleSchema } from "@/lib/validation/court.schema";
import { writeAuditLog } from "@/lib/services/audit-service";
import { newId } from "@/lib/utils/ids";

export async function createCourtAction(formData: FormData) {
  const user = await requirePermission("courts:manage");
  const input = courtSchema.parse(Object.fromEntries(formData.entries()));
  const court = await courtsRepository.create({ id: newId("court"), ...input });
  await writeAuditLog({ actorId: user.id, actorName: user.name, action: "court.create", entityType: "court", entityId: court.id, details: JSON.stringify({ name: court.name }) });
  revalidatePath("/courts");
  revalidatePath("/schedule");
}

export async function updateCourtStatusAction(formData: FormData) {
  const user = await requirePermission("courts:manage");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "active") as "active" | "inactive" | "maintenance";
  const court = await courtsRepository.update(id, { status });
  await writeAuditLog({ actorId: user.id, actorName: user.name, action: "court.status", entityType: "court", entityId: id, details: JSON.stringify({ status }) });
  revalidatePath("/courts");
  revalidatePath("/schedule");
}


export async function deleteCourtAction(formData: FormData) {
  const user = await requirePermission("courts:manage");
  const id = String(formData.get("id") ?? "");
  const court = await courtsRepository.findById(id);
  if (!court) throw new Error("Court not found.");
  await pricingRepository.deleteForCourt(id);
  await courtsRepository.delete(id);
  await writeAuditLog({
    actorId: user.id,
    actorName: user.name,
    action: "court.delete",
    entityType: "court",
    entityId: id,
    details: JSON.stringify({ name: court.name, deletedPricingRulesForCourt: true })
  });
  revalidatePath("/courts");
  revalidatePath("/schedule");
  revalidatePath("/bookings");
}

export async function createPricingRuleAction(formData: FormData) {
  const user = await requirePermission("pricing:manage");
  const input = pricingRuleSchema.parse({
    ...Object.fromEntries(formData.entries()),
    isPeak: formData.get("isPeak") === "on" || formData.get("isPeak") === "true"
  });
  const rule = await pricingRepository.create({ id: newId("price"), ...input });
  await writeAuditLog({ actorId: user.id, actorName: user.name, action: "pricing.create", entityType: "pricingRule", entityId: rule.id, details: JSON.stringify(rule) });
  revalidatePath("/courts");
}

export async function deletePricingRuleAction(formData: FormData) {
  const user = await requirePermission("pricing:manage");
  const id = String(formData.get("id") ?? "");
  await pricingRepository.delete(id);
  await writeAuditLog({ actorId: user.id, actorName: user.name, action: "pricing.delete", entityType: "pricingRule", entityId: id, details: "Deleted pricing rule" });
  revalidatePath("/courts");
}
