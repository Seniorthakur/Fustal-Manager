import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { Admin, AdminStatus, Role } from "@/types/domain";
import { nowIso } from "./row-utils";

type AdminRow = {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  role: string;
  status: string;
  lastLoginAt: Date | null;
  createdAt: Date;
};

function normalize(row: AdminRow): Admin {
  return {
    id: row.id,
    name: row.name,
    username: row.username.toLowerCase(),
    passwordHash: row.passwordHash,
    role: row.role as Role,
    status: row.status as AdminStatus,
    lastLoginAt: row.lastLoginAt?.toISOString() ?? "",
    createdAt: row.createdAt.toISOString()
  };
}

function createData(admin: Admin): Prisma.AdminCreateInput {
  return {
    id: admin.id,
    name: admin.name,
    username: admin.username.trim().toLowerCase(),
    passwordHash: admin.passwordHash,
    role: admin.role,
    status: admin.status,
    lastLoginAt: admin.lastLoginAt ? new Date(admin.lastLoginAt) : null,
    createdAt: admin.createdAt ? new Date(admin.createdAt) : new Date()
  };
}

function updateData(updates: Partial<Admin>): Prisma.AdminUpdateInput {
  const data: Prisma.AdminUpdateInput = {};
  if (updates.name !== undefined) data.name = updates.name;
  if (updates.username !== undefined) data.username = updates.username.trim().toLowerCase();
  if (updates.passwordHash !== undefined) data.passwordHash = updates.passwordHash;
  if (updates.role !== undefined) data.role = updates.role;
  if (updates.status !== undefined) data.status = updates.status;
  if (updates.lastLoginAt !== undefined) data.lastLoginAt = updates.lastLoginAt ? new Date(updates.lastLoginAt) : null;
  if (updates.createdAt !== undefined && updates.createdAt) data.createdAt = new Date(updates.createdAt);
  return data;
}

export const adminsRepository = {
  async list() {
    const rows = await prisma.admin.findMany({ orderBy: [{ role: "desc" }, { name: "asc" }] });
    return rows.map(normalize);
  },

  async findById(id: string) {
    const row = await prisma.admin.findUnique({ where: { id } });
    return row ? normalize(row) : null;
  },

  async findByUsername(username: string) {
    const normalized = username.trim().toLowerCase();
    const row = await prisma.admin.findUnique({ where: { username: normalized } });
    return row ? normalize(row) : null;
  },

  async create(admin: Admin) {
    return normalize(await prisma.admin.create({ data: createData(admin) }));
  },

  async update(id: string, updates: Partial<Admin>) {
    return normalize(await prisma.admin.update({ where: { id }, data: updateData(updates) }));
  },

  async setStatus(id: string, status: AdminStatus) {
    return this.update(id, { status });
  },

  async updateLastLogin(id: string) {
    return this.update(id, { lastLoginAt: nowIso() });
  },

  async delete(id: string) {
    await prisma.admin.delete({ where: { id } });
  }
};
