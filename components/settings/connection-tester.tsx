"use client";

import { useState } from "react";
import { Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConnectionTester() {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function test() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/health/database", { cache: "no-store" });
      const body = await response.json();
      setMessage(body.message || (body.ok ? "Database connection succeeded." : "Database connection failed."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Database connection failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button type="button" variant="secondary" onClick={test} disabled={loading}>
        <Database className="h-4 w-4" aria-hidden="true" /> {loading ? "Testing..." : "Test database"}
      </Button>
      {message ? <p className="rounded-xl bg-muted p-3 text-sm leading-6 text-muted-foreground" role="status">{message}</p> : null}
    </div>
  );
}
