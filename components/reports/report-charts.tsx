"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ReportCharts({ revenueByDay, bookingsByAdmin }: { revenueByDay: Array<{ date: string; revenue: number }>; bookingsByAdmin: Array<{ admin: string; bookings: number; revenue: number }> }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Revenue by day</CardTitle><CardDescription>Collected amount from active bookings.</CardDescription></CardHeader>
        <CardContent><div className="h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={revenueByDay}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip /><Line type="monotone" dataKey="revenue" stroke="currentColor" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Bookings by admin</CardTitle><CardDescription>Operational activity by account.</CardDescription></CardHeader>
        <CardContent><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={bookingsByAdmin}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="admin" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="bookings" fill="currentColor" radius={[8,8,0,0]} /></BarChart></ResponsiveContainer></div></CardContent>
      </Card>
    </div>
  );
}
