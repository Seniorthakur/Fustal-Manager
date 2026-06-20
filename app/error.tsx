"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <div className="max-w-lg rounded-2xl border border-border bg-card p-6 shadow-card">
        <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{error.message || "The app could not complete that request."}</p>
        <Button className="mt-5" onClick={reset}>Retry</Button>
      </div>
    </main>
  );
}
