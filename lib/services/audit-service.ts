import "server-only";

import { auditLogRepository } from "@/lib/repositories/audit-log-repository";
import { newId } from "@/lib/utils/ids";
import type { AuditLog } from "@/types/domain";

export async function writeAuditLog(input: Omit<AuditLog, "id" | "timestamp">) {
  await auditLogRepository.create({
    id: newId("audit"),
    timestamp: new Date().toISOString(),
    ...input
  });
}
