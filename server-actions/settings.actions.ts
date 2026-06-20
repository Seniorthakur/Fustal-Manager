"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/require-session";
import { settingsRepository } from "@/lib/repositories/settings-repository";
import { settingsSchema } from "@/lib/validation/settings.schema";
import { writeAuditLog } from "@/lib/services/audit-service";
import { testDatabaseConnection } from "@/lib/db/health";
import { seedDatabase } from "@/lib/db/seed-database";

export async function updateSettingsAction(formData: FormData) {
  const user = await requirePermission("settings:update");
  const input = settingsSchema.parse(Object.fromEntries(formData.entries()));
  await settingsRepository.updateMany(input);
  await writeAuditLog({ actorId: user.id, actorName: user.name, action: "settings.update", entityType: "settings", entityId: "global", details: JSON.stringify(input) });
  revalidatePath("/settings");
  revalidatePath("/schedule");
}

export async function testDatabaseConnectionAction() {
  await requirePermission("settings:view");
  return testDatabaseConnection();
}

export async function resetDatabaseSeedAction() {
  const user = await requirePermission("settings:update");
  await seedDatabase({ reset: true });
  await writeAuditLog({ actorId: user.id, actorName: user.name, action: "settings.reset_database_seed", entityType: "system", entityId: "database", details: "Reset the Prisma SQLite database to seed data" });
  revalidatePath("/");
  revalidatePath("/settings");
  revalidatePath("/schedule");
  revalidatePath("/bookings");
}
