import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/require-session";
import { testDatabaseConnection } from "@/lib/db/health";

export const runtime = "nodejs";

export async function GET() {
  await requirePermission("settings:view");
  try {
    const result = await testDatabaseConnection();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Database connection failed" }, { status: 500 });
  }
}
