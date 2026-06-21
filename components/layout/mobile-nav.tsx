"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { Role } from "@/types/domain";
import { navItems } from "./nav-items";

export function MobileNav({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <Button type="button" variant="outline" size="icon" aria-label="Open navigation menu" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>
      {open ? (
        <div className="fixed inset-0 z-[9999] isolate lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 h-full w-full bg-slate-950/55 backdrop-blur-sm dark:bg-black/70"
            onClick={() => setOpen(false)}
          />
          <aside
            className="relative z-10 flex h-dvh min-h-dvh w-[86vw] max-w-[340px] flex-col overflow-y-auto border-r border-border bg-background text-foreground shadow-2xl dark:bg-background"
            style={{ backgroundColor: "hsl(var(--background))", color: "hsl(var(--foreground))" }}
          >
            <div className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-border bg-background px-4 py-3 dark:bg-background" style={{ backgroundColor: "hsl(var(--background))" }}>
              <p className="font-display text-xl font-bold">FutsalHQ</p>
              <Button type="button" variant="ghost" size="icon" aria-label="Close navigation menu" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
            <nav className="grid gap-2 bg-background p-4 dark:bg-background" style={{ backgroundColor: "hsl(var(--background))" }}>
              {navItems
                .filter((item) => item.roles.includes(role))
                .map((item) => {
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex min-h-12 items-center gap-3 rounded-2xl border px-4 text-base font-semibold transition-colors",
                        active
                          ? "border-brand bg-brand text-brand-foreground shadow-card"
                          : "border-border bg-card text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
            </nav>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
