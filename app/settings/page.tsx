import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SettingsForm } from "@/components/settings/settings-form";
import { ConnectionTester } from "@/components/settings/connection-tester";
import { settingsRepository } from "@/lib/repositories/settings-repository";
import { auditLogRepository } from "@/lib/repositories/audit-log-repository";
import { resetDatabaseSeedAction } from "@/server-actions/settings.actions";
import type { AuditLog } from "@/types/domain";

export default async function SettingsPage() {
  const [settings, auditLog] = await Promise.all([settingsRepository.map(), auditLogRepository.list(50)]);
  const databaseUrl = maskDatabaseUrl(process.env.DATABASE_URL || "file:../.data/futsal.db");

  return (
    <AppShell>
      <PageHeader title="Settings" description="Super Admin only. Configure facility defaults, verify the secure database, and review audit activity." />
      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader><CardTitle>Facility settings</CardTitle><CardDescription>These defaults drive schedule slots, money formatting, and facility context.</CardDescription></CardHeader>
          <CardContent><SettingsForm settings={settings} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Secure app database</CardTitle><CardDescription>All booking data is stored server-side with Prisma and SQLite. No Google Sheets credentials are required.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-sm text-muted-foreground">Current storage</p>
              <Badge variant="success">Prisma SQLite</Badge>
              <p className="mt-3 break-words text-sm leading-6 text-muted-foreground">Database URL: <span className="font-mono tabular">{databaseUrl}</span></p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">Keep the SQLite file outside public folders, restrict server filesystem access, and use encrypted disks/backups in production.</p>
            </div>
            <ConnectionTester />
            {process.env.NODE_ENV !== "production" ? <form action={resetDatabaseSeedAction}><Button type="submit" variant="outline">Reset demo database</Button></form> : null}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Audit log</CardTitle><CardDescription>Recent activity shown as timestamp, actor details, and full untruncated details.</CardDescription></CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {auditLog.map((entry) => (
              <article key={entry.id} className="rounded-2xl border border-border bg-background p-4">
                <dl className="grid gap-4 lg:grid-cols-[220px_280px_1fr]">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Timestamp</dt>
                    <dd className="mt-1 text-sm font-medium tabular">{entry.timestamp}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actor details</dt>
                    <dd className="mt-1 space-y-1 text-sm">
                      <p className="font-medium">{entry.actorName}</p>
                      <p className="break-all text-xs text-muted-foreground tabular">{entry.actorId}</p>
                      <p><Badge variant="outline">{entry.action}</Badge></p>
                      <p className="break-all text-xs text-muted-foreground">{entry.entityType} / {entry.entityId}</p>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Full details</dt>
                    <dd className="mt-1 rounded-xl border border-border bg-card p-3">
                      <pre className="whitespace-pre-wrap break-words text-xs leading-5 text-muted-foreground">{formatAuditDetails(entry)}</pre>
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function maskDatabaseUrl(url: string) {
  if (url.startsWith("file:")) return url;
  return url.replace(/:\/\/([^:@]+):([^@]+)@/, "://***:***@");
}

function formatAuditDetails(entry: AuditLog) {
  const details = entry.details || "No additional details.";
  try {
    const parsed = JSON.parse(details);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return details;
  }
}
