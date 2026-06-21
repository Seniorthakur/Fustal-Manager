import "server-only";

import { prisma } from "@/lib/db/prisma";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import type { Setting } from "@/types/domain";

function normalize(row: { key: string; value: string }): Setting {
  return {
    key: row.key,
    value: row.value
  };
}

export type SettingsMap = typeof DEFAULT_SETTINGS;

export const settingsRepository = {
  async list() {
    const rows = await prisma.setting.findMany({ orderBy: { key: "asc" } });
    return rows.map(normalize);
  },

  async map() {
    const rows = await this.list();
    const values = { ...DEFAULT_SETTINGS } as Record<string, string>;
    for (const row of rows) values[row.key] = row.value;
    return values;
  },

  async upsert(key: string, value: string) {
    return normalize(await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } }));
  },

  async updateMany(values: Record<string, string | number>) {
    for (const [key, value] of Object.entries(values)) {
      await this.upsert(key, String(value));
    }
    return this.map();
  }
};
