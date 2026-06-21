"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Goal } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Role } from "@/types/domain";
import { navItems } from "./nav-items";

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-border bg-card/85 px-4 py-5 backdrop-blur-xl lg:flex lg:flex-col">
      <Link href="/" className="mb-8 flex min-h-11 items-center gap-3 rounded-xl px-2 focus-visible:ring-2 focus-visible:ring-ring" aria-label="Go to dashboard">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-card">
          <Goal className="h-5 w-5" aria-hidden="true" />
        </span>
        <span>
          <span className="block font-display text-xl font-bold tracking-tight">FutsalHQ</span>
          <span className="block text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Bookings</span>
        </span>
      </Link>

      <nav className="grid gap-1" aria-label="Primary navigation">
        {navItems
          .filter((item) => item.roles.includes(role))
          .map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition duration-200 ease-out",
                  active ? "bg-brand text-brand-foreground shadow-card" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="mt-auto rounded-2xl border border-border bg-background/70 p-4">
        <p className="text-sm font-semibold">Server-enforced RBAC</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">Routes and mutations check role and active status on the server.</p>
      </div>
    </aside>
  );
}
