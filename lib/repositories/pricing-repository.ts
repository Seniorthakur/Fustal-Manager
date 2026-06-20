import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { PricingRule } from "@/types/domain";

type PricingRuleRow = {
  id: string;
  courtId: string;
  dayOfWeek: string;
  startWindow: string;
  endWindow: string;
  isPeak: boolean;
  hourlyRate: number;
};

function normalize(row: PricingRuleRow): PricingRule {
  return {
    id: row.id,
    courtId: row.courtId,
    dayOfWeek: row.dayOfWeek || "weekday",
    startWindow: row.startWindow || "06:00",
    endWindow: row.endWindow || "22:00",
    isPeak: row.isPeak,
    hourlyRate: Number(row.hourlyRate)
  };
}

function createData(rule: PricingRule): Prisma.PricingRuleCreateInput {
  return { ...rule };
}

function updateData(updates: Partial<PricingRule>): Prisma.PricingRuleUpdateInput {
  const data: Prisma.PricingRuleUpdateInput = {};
  if (updates.courtId !== undefined) data.courtId = updates.courtId;
  if (updates.dayOfWeek !== undefined) data.dayOfWeek = updates.dayOfWeek;
  if (updates.startWindow !== undefined) data.startWindow = updates.startWindow;
  if (updates.endWindow !== undefined) data.endWindow = updates.endWindow;
  if (updates.isPeak !== undefined) data.isPeak = updates.isPeak;
  if (updates.hourlyRate !== undefined) data.hourlyRate = updates.hourlyRate;
  return data;
}

export const pricingRepository = {
  async list() {
    const rows = await prisma.pricingRule.findMany({ orderBy: [{ courtId: "asc" }, { startWindow: "asc" }] });
    return rows.map(normalize);
  },

  async findByCourt(courtId: string) {
    const rules = await this.list();
    return rules.filter((rule) => rule.courtId === courtId || rule.courtId === "all");
  },

  async create(rule: PricingRule) {
    return normalize(await prisma.pricingRule.create({ data: createData(rule) }));
  },

  async update(id: string, updates: Partial<PricingRule>) {
    return normalize(await prisma.pricingRule.update({ where: { id }, data: updateData(updates) }));
  },

  async delete(id: string) {
    await prisma.pricingRule.delete({ where: { id } });
  },

  async deleteForCourt(courtId: string) {
    await prisma.pricingRule.deleteMany({ where: { courtId } });
  }
};
