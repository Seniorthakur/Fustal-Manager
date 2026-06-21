import { Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateCourtForm, CreatePricingRuleForm } from "@/components/courts/court-forms";
import { updateCourtStatusAction, deleteCourtAction, deletePricingRuleAction } from "@/server-actions/courts.actions";
import { getCurrentUser } from "@/lib/auth/require-session";
import { courtsRepository } from "@/lib/repositories/courts-repository";
import { pricingRepository } from "@/lib/repositories/pricing-repository";
import { settingsRepository } from "@/lib/repositories/settings-repository";
import { formatCurrency } from "@/lib/utils/money";

export default async function CourtsPage() {
  const [user, courts, pricing, settings] = await Promise.all([getCurrentUser(), courtsRepository.list(), pricingRepository.list(), settingsRepository.map()]);
  const canManage = user?.role === "super_admin";

  return (
    <AppShell>
      <PageHeader title="Courts & pricing" description="Booking Admins can view courts and rates. Super Admins manage pitches, status, hours, and pricing rules." />
      <Card>
        <CardHeader><CardTitle>Courts</CardTitle><CardDescription>{canManage ? "Manage court status, operating hours, and remove unused courts." : "Read-only court view for Booking Admins."}</CardDescription></CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <Table className="min-w-[840px]">
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Hours</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {courts.map((court) => (
                  <TableRow key={court.id}>
                    <TableCell className="font-medium">{court.name}</TableCell>
                    <TableCell className="capitalize">{court.type}</TableCell>
                    <TableCell className="tabular">{court.openTime}-{court.closeTime}</TableCell>
                    <TableCell><Badge variant={court.status === "active" ? "success" : "muted"}>{court.status}</Badge></TableCell>
                    <TableCell>
                      {canManage ? (
                        <div className="flex flex-wrap justify-end gap-2">
                          {court.status !== "active" ? <StatusForm id={court.id} status="active" label="Activate" /> : null}
                          {court.status !== "maintenance" ? <StatusForm id={court.id} status="maintenance" label="Maintenance" /> : null}
                          {court.status !== "inactive" ? <StatusForm id={court.id} status="inactive" label="Deactivate" /> : null}
                          <form action={deleteCourtAction}>
                            <input type="hidden" name="id" value={court.id} />
                            <Button type="submit" variant="ghost" size="sm" aria-label={`Delete ${court.name}`}>
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                              Delete
                            </Button>
                          </form>
                        </div>
                      ) : <span className="block text-right text-sm text-muted-foreground">Read-only</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Pricing rules</CardTitle><CardDescription>Rules match by court, day bucket, and time window. Manual override remains possible in booking forms.</CardDescription></CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <Table className="min-w-[780px]">
              <TableHeader><TableRow><TableHead>Court</TableHead><TableHead>Day</TableHead><TableHead>Window</TableHead><TableHead>Peak</TableHead><TableHead>Rate</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {pricing.map((rule) => {
                  const court = courts.find((item) => item.id === rule.courtId)?.name ?? "All courts";
                  return (
                    <TableRow key={rule.id}>
                      <TableCell>{court}</TableCell>
                      <TableCell className="capitalize">{rule.dayOfWeek}</TableCell>
                      <TableCell className="tabular">{rule.startWindow}-{rule.endWindow}</TableCell>
                      <TableCell><Badge variant={rule.isPeak ? "warning" : "muted"}>{rule.isPeak ? "Peak" : "Base"}</Badge></TableCell>
                      <TableCell className="tabular">{formatCurrency(rule.hourlyRate, settings.currency)}</TableCell>
                      <TableCell className="text-right">
                        {canManage ? <form action={deletePricingRuleAction}><input type="hidden" name="id" value={rule.id} /><Button type="submit" variant="ghost" size="sm">Delete</Button></form> : <span className="text-sm text-muted-foreground">Read-only</span>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {canManage ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card><CardHeader><CardTitle>Create court</CardTitle></CardHeader><CardContent><CreateCourtForm /></CardContent></Card>
          <Card><CardHeader><CardTitle>Add pricing rule</CardTitle></CardHeader><CardContent><CreatePricingRuleForm courts={courts} /></CardContent></Card>
        </div>
      ) : null}
    </AppShell>
  );
}

function StatusForm({ id, status, label }: { id: string; status: string; label: string }) {
  return (
    <form action={updateCourtStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" variant="secondary" size="sm">{label}</Button>
    </form>
  );
}
