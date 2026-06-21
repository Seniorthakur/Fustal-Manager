import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateAdminLauncher } from "@/components/admins/create-admin-launcher";
import { adminsRepository } from "@/lib/repositories/admins-repository";
import { bookingsRepository } from "@/lib/repositories/bookings-repository";
import { setAdminStatusAction, resetAdminPasswordAction, deleteAdminAction } from "@/server-actions/admins.actions";

export default async function AdminsPage() {
  const [admins, bookings] = await Promise.all([adminsRepository.list(), bookingsRepository.list()]);
  const activeBookingAdmins = admins.filter((admin) => admin.role === "booking_admin" && admin.status === "active").length;

  return (
    <AppShell>
      <PageHeader
        title="Admin management"
        description="Super Admin only. Create staff accounts, reset temporary passwords, and deactivate access immediately."
        action={<CreateAdminLauncher />}
      />
      {activeBookingAdmins > 5 ? (
        <Card className="border-status-pending bg-status-pending/10 p-4 text-amber-900 dark:text-amber-100">More than 5 active Booking Admins are configured. Reduce active seats to stay within the intended operating model.</Card>
      ) : activeBookingAdmins === 5 ? (
        <Card className="border-status-pending bg-status-pending/10 p-4 text-amber-900 dark:text-amber-100">You have reached 5 active Booking Admins. Deactivate one before creating another.</Card>
      ) : null}
      <Card>
        <CardHeader><CardTitle>Admins</CardTitle><CardDescription>{admins.length} accounts in the secure app database. Use the Add admin button above; no page scrolling required.</CardDescription></CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <Table className="min-w-[980px]">
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Username</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Last login</TableHead><TableHead>Bookings</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {admins.map((admin) => {
                  const bookingCount = bookings.filter((booking) => booking.createdBy === admin.id).length;
                  return (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.name}</TableCell>
                      <TableCell className="tabular">{admin.username}</TableCell>
                      <TableCell><Badge variant={admin.role === "super_admin" ? "default" : "muted"}>{admin.role.replace("_", " ")}</Badge></TableCell>
                      <TableCell><Badge variant={admin.status === "active" ? "success" : "danger"}>{admin.status}</Badge></TableCell>
                      <TableCell className="tabular">{admin.lastLoginAt || "-"}</TableCell>
                      <TableCell className="tabular">{bookingCount}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-2">
                          {admin.role !== "super_admin" ? <StatusForm id={admin.id} status={admin.status === "active" ? "inactive" : "active"} label={admin.status === "active" ? "Deactivate" : "Reactivate"} /> : null}
                          {admin.role !== "super_admin" ? <ResetPasswordForm id={admin.id} /> : null}
                          {admin.role !== "super_admin" ? <DeleteAdminForm id={admin.id} /> : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function StatusForm({ id, status, label }: { id: string; status: string; label: string }) {
  return <form action={setAdminStatusAction}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value={status} /><Button type="submit" variant="secondary" size="sm">{label}</Button></form>;
}

function ResetPasswordForm({ id }: { id: string }) {
  return <form action={resetAdminPasswordAction} className="flex flex-wrap justify-end gap-2"><input type="hidden" name="adminId" value={id} /><Input name="temporaryPassword" placeholder="New temp password" className="h-9 w-44 text-sm" required /><Button type="submit" variant="outline" size="sm">Reset</Button></form>;
}

function DeleteAdminForm({ id }: { id: string }) {
  return <form action={deleteAdminAction}><input type="hidden" name="id" value={id} /><Button type="submit" variant="ghost" size="sm">Delete</Button></form>;
}
