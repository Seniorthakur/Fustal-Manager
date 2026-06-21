"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { LockKeyhole, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function safeCallbackPath(rawCallbackUrl: string | null) {
  if (!rawCallbackUrl) return "/";

  try {
    const base = "http://local.invalid";
    const url = rawCallbackUrl.startsWith("/") ? new URL(rawCallbackUrl, base) : new URL(rawCallbackUrl);
    const path = `${url.pathname}${url.search}${url.hash}` || "/";
    if (!path.startsWith("/")) return "/";
    if (path === "/login" || path.startsWith("/login?")) return "/";
    if (path.startsWith("/api/auth")) return "/";
    return path;
  } catch {
    return "/";
  }
}

export function LoginForm() {
  const params = useSearchParams();
  const callbackPath = useMemo(() => safeCallbackPath(params.get("callbackUrl")), [params]);
  const initialError = params.get("error");
  const [error, setError] = useState<string | null>(
    initialError === "inactive" ? "This account is inactive. Ask the Super Admin to reactivate it." : null
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      username: String(formData.get("username") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
      redirect: false,
      callbackUrl: callbackPath
    });

    if (result?.error || !result?.ok) {
      setLoading(false);
      const detail = result?.error || "";
      if (detail.toLowerCase().includes("database") || detail.includes("P2021")) {
        setError("Database is not ready yet. Stop the server, run `npm run db:setup`, then start the app again.");
      } else {
        setError("Invalid username or password, or this account is inactive.");
      }
      return;
    }

    // A full navigation is more reliable than a client-only router push immediately
    // after a credentials callback, especially when testing from a LAN IP address.
    window.location.assign(callbackPath);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input id="username" name="username" autoComplete="username" className="pl-9" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input id="password" name="password" type="password" autoComplete="current-password" className="pl-9" required />
        </div>
      </div>
      {error ? <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive" role="alert">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
      <p className="text-center text-xs leading-5 text-muted-foreground">No self sign-up. Booking Admin accounts are created by the Super Admin.</p>
    </form>
  );
}
