import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/require-session";
import { getReports } from "@/lib/services/reports-service";
import { toCsv } from "@/lib/utils/csv";

export const runtime = "nodejs";

export async function GET() {
  await requirePermission("reports:view");
  const reports = await getReports();
  const rows = [
    ...reports.revenueByDay.map((row) => ({ report: "revenue_by_day", ...row })),
    ...reports.topCustomers.map((row) => ({ report: "top_customers", ...row })),
    ...reports.bookingsByAdmin.map((row) => ({ report: "bookings_by_admin", ...row }))
  ];
  const csv = toCsv(rows);
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="futsal-report-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}
