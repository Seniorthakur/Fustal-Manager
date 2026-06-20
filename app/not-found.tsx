import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <div className="max-w-lg rounded-2xl border border-border bg-card p-6 text-center shadow-card">
        <h1 className="font-display text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">That route or record does not exist.</p>
        <Button asChild className="mt-5"><Link href="/">Back to dashboard</Link></Button>
      </div>
    </main>
  );
}
