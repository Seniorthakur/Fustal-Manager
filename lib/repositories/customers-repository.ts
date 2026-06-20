import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { Customer } from "@/types/domain";

type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: Date;
  notes: string;
};

function normalize(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email ?? "",
    createdAt: row.createdAt.toISOString(),
    notes: row.notes ?? ""
  };
}

function createData(customer: Customer): Prisma.CustomerCreateInput {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone.replace(/\s/g, ""),
    email: customer.email || "",
    createdAt: customer.createdAt ? new Date(customer.createdAt) : new Date(),
    notes: customer.notes || ""
  };
}

function updateData(updates: Partial<Customer>): Prisma.CustomerUpdateInput {
  const data: Prisma.CustomerUpdateInput = {};
  if (updates.name !== undefined) data.name = updates.name;
  if (updates.phone !== undefined) data.phone = updates.phone.replace(/\s/g, "");
  if (updates.email !== undefined) data.email = updates.email;
  if (updates.notes !== undefined) data.notes = updates.notes;
  if (updates.createdAt !== undefined && updates.createdAt) data.createdAt = new Date(updates.createdAt);
  return data;
}

export const customersRepository = {
  async list() {
    const rows = await prisma.customer.findMany({ orderBy: { name: "asc" } });
    return rows.map(normalize);
  },

  async findById(id: string) {
    const row = await prisma.customer.findUnique({ where: { id } });
    return row ? normalize(row) : null;
  },

  async findByPhone(phone: string) {
    const normalized = phone.replace(/\s/g, "");
    const row = await prisma.customer.findUnique({ where: { phone: normalized } });
    return row ? normalize(row) : null;
  },

  async search(query: string) {
    const normalized = query.toLowerCase().trim();
    const customers = await this.list();
    if (!normalized) return customers;
    return customers.filter((customer) => `${customer.name} ${customer.phone} ${customer.email}`.toLowerCase().includes(normalized));
  },

  async create(customer: Customer) {
    return normalize(await prisma.customer.create({ data: createData(customer) }));
  },

  async update(id: string, updates: Partial<Customer>) {
    return normalize(await prisma.customer.update({ where: { id }, data: updateData(updates) }));
  },

  async delete(id: string) {
    await prisma.customer.delete({ where: { id } });
  }
};
