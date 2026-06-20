import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { AuditLog } from "@/types/domain";

type AuditLogRow = {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: Date;
};

function normalize(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    actorId: row.actorId,
    actorName: row.actorName,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    details: row.details ?? "",
    timestamp: row.timestamp.toISOString()
  };
}

function createData(entry: AuditLog): Prisma.AuditLogCreateInput {
  return {
    id: entry.id,
    actorId: entry.actorId,
    actorName: entry.actorName,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    details: entry.details || "",
    timestamp: entry.timestamp ? new Date(entry.timestamp) : new Date()
  };
}

export const auditLogRepository = {
  async list(limit = 100) {
    const rows = await prisma.auditLog.findMany({ take: limit, orderBy: { timestamp: "desc" } });
    return rows.map(normalize);
  },

  async create(entry: AuditLog) {
    return normalize(await prisma.auditLog.create({ data: createData(entry) }));
  }
};
