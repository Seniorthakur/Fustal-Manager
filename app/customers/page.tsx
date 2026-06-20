import Link from "next/link";
import { Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomerForm } from "@/components/customers/customer-form";
import { deleteCustomerAction } from "@/server-actions/customers.actions";
import { customersRepository } from "@/lib/repositories/customers-repository";
import { bookingsRepository } from "@/lib/repositories/bookings-repository";
import { settingsRepository } from "@/lib/repositories/settings-repository";
import { formatCurrency } from "@/lib/utils/money";

export default async function CustomersPage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  const params = (await searchParams) ?? {};
  const query = params.search ?? "";
  const [customers, bookings, settings] = await Promise.all([customersRepository.search(query), bookingsRepository.list(), settingsRepository.map()]);

  return (
    <AppShell>
      <PageHeader title="Customers" description="Customer directory with booking history, last visit, and outstanding balance." />
      <Card>
        <CardContent className="pt-5">
          <form className="flex flex-col gap-3 sm:flex-row" action="/customers">
            <Input name="search" placeholder="Search name, phone, or email" defaultValue={query} />
            <Button type="submit" variant="secondary">Search</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
          <CardDescription>{customers.length} customers shown.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <Table className="min-w-[820px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Total bookings</TableHead>
                  <TableHead>Last visit</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => {
                  const customerBookings = bookings.filter((booking) => booking.customerId === customer.id);
                  const lastVisit = customerBookings.sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? "-";
                  const outstanding = customerBookings.reduce((sum, booking) => sum + Math.max(booking.price - booking.amountPaid, 0), 0);
                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}<div className="text-xs text-muted-foreground">{customer.email || "No email"}</div></TableCell>
                      <TableCell className="tabular">{customer.phone}</TableCell>
                      <TableCell className="tabular">{customerBookings.length}</TableCell>
                      <TableCell className="tabular">{lastVisit}</TableCell>
                      <TableCell className="tabular">{formatCurrency(outstanding, settings.currency)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button asChild variant="secondary" size="sm"><Link href={`/customers/${customer.id}`}>View</Link></Button>
                          <form action={deleteCustomerAction}>
                            <input type="hidden" name="id" value={customer.id} />
                            <Button type="submit" variant="ghost" size="sm" aria-label={`Delete ${customer.name}`}>
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                              Delete
                            </Button>
                          </form>
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
      <Card>
        <CardHeader>
          <CardTitle>Add customer</CardTitle>
          <CardDescription>Customers can also be created inline from a booking.</CardDescription>
        </CardHeader>
        <CardContent><CustomerForm /></CardContent>
      </Card>
    </AppShell>
  );
}
