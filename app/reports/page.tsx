import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportCharts } from "@/components/reports/report-charts";
import { getReports, occupancyByCourt } from "@/lib/services/reports-service";
import { settingsRepository } from "@/lib/repositories/settings-repository";
import { formatCurrency } from "@/lib/utils/money";

export default async function ReportsPage() {
  const [reports, occupancy, settings] = await Promise.all([getReports(), occupancyByCourt(), settingsRepository.map()]);

  return (
    <AppShell>
      <PageHeader title="Reports" description="Revenue, occupancy, top customers, and staff activity with export-ready tables." action={<Button asChild variant="secondary"><a href="/api/reports/export">Export CSV</a></Button>} />
      <ReportCharts revenueByDay={reports.revenueByDay} bookingsByAdmin={reports.bookingsByAdmin} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top customers</CardTitle><CardDescription>Ranked by paid revenue.</CardDescription></CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-2xl border border-border"><Table><TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Bookings</TableHead><TableHead>Revenue</TableHead><TableHead>Outstanding</TableHead></TableRow></TableHeader><TableBody>{reports.topCustomers.map((row) => <TableRow key={row.customer}><TableCell className="font-medium">{row.customer}</TableCell><TableCell className="tabular">{row.bookings}</TableCell><TableCell className="tabular">{formatCurrency(row.revenue, settings.currency)}</TableCell><TableCell className="tabular">{formatCurrency(row.outstanding, settings.currency)}</TableCell></TableRow>)}</TableBody></Table></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Occupancy per court</CardTitle><CardDescription>Booked hours and count by court.</CardDescription></CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-2xl border border-border"><Table><TableHeader><TableRow><TableHead>Court</TableHead><TableHead>Hours booked</TableHead><TableHead>Bookings</TableHead></TableRow></TableHeader><TableBody>{occupancy.map((row) => <TableRow key={row.court}><TableCell className="font-medium">{row.court}</TableCell><TableCell className="tabular">{row.hours}</TableCell><TableCell className="tabular">{row.bookings}</TableCell></TableRow>)}</TableBody></Table></div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
