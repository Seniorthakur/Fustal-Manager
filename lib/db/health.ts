import "server-only";

import { prisma } from "./prisma";

function maskDatabaseUrl(url: string) {
  if (url.startsWith("file:")) return url;
  return url.replace(/:\/\/([^:@]+):([^@]+)@/, "://***:***@");
}

function isMissingTableError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("does not exist") || message.includes("P2021") || message.includes("no such table");
}

export async function testDatabaseConnection() {
  const databaseUrl = maskDatabaseUrl(process.env.DATABASE_URL || "file:../.data/futsal.db");

  try {
    await prisma.$queryRaw`SELECT 1`;
    const [admins, bookings, courts] = await Promise.all([
      prisma.admin.count(),
      prisma.booking.count(),
      prisma.court.count()
    ]);

    return {
      ok: true,
      mode: "prisma_sqlite",
      databaseUrl,
      message: `Database connection succeeded. ${admins} admins, ${courts} courts, and ${bookings} bookings are stored.`
    };
  } catch (error) {
    if (isMissingTableError(error)) {
      return {
        ok: false,
        mode: "prisma_sqlite",
        databaseUrl,
        message: "Database file exists but tables are missing. Run npm run db:setup once, then restart the app."
      };
    }
    throw error;
  }
}
