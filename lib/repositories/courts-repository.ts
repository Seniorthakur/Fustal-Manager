import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { Court, CourtStatus, CourtType } from "@/types/domain";

type CourtRow = {
  id: string;
  name: string;
  type: string;
  openTime: string;
  closeTime: string;
  status: string;
};

function normalize(row: CourtRow): Court {
  return {
    id: row.id,
    name: row.name,
    type: row.type as CourtType,
    openTime: row.openTime || "06:00",
    closeTime: row.closeTime || "22:00",
    status: row.status as CourtStatus
  };
}

function createData(court: Court): Prisma.CourtCreateInput {
  return { ...court };
}

function updateData(updates: Partial<Court>): Prisma.CourtUpdateInput {
  const data: Prisma.CourtUpdateInput = {};
  if (updates.name !== undefined) data.name = updates.name;
  if (updates.type !== undefined) data.type = updates.type;
  if (updates.openTime !== undefined) data.openTime = updates.openTime;
  if (updates.closeTime !== undefined) data.closeTime = updates.closeTime;
  if (updates.status !== undefined) data.status = updates.status;
  return data;
}

export const courtsRepository = {
  async list() {
    const rows = await prisma.court.findMany({ orderBy: { name: "asc" } });
    return rows.map(normalize);
  },

  async active() {
    return (await this.list()).filter((court) => court.status === "active");
  },

  async findById(id: string) {
    const row = await prisma.court.findUnique({ where: { id } });
    return row ? normalize(row) : null;
  },

  async create(court: Court) {
    return normalize(await prisma.court.create({ data: createData(court) }));
  },

  async update(id: string, updates: Partial<Court>) {
    return normalize(await prisma.court.update({ where: { id }, data: updateData(updates) }));
  },

  async delete(id: string) {
    await prisma.court.delete({ where: { id } });
  }
};
