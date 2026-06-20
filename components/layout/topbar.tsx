"use client";

import { signOut } from "next-auth/react";
import { LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { Role } from "@/types/domain";
import { MobileNav } from "./mobile-nav";

export function Topbar({ name, role }: { name: string; role: Role }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background lg:ml-72 lg:bg-background/82 lg:backdrop-blur-xl">
      <div className="flex min-h-16 items-center gap-2 px-3 sm:gap-3 sm:px-5 md:px-6 lg:px-8">
        <MobileNav role={role} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="text-xs capitalize text-muted-foreground">{role.replace("_", " ")}</p>
        </div>
        <Button asChild variant="default" size="sm" className="hidden shrink-0 sm:inline-flex">
          <Link href="/bookings#new-booking">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New booking
          </Link>
        </Button>
        <ThemeToggle />
        <Button type="button" variant="ghost" size="icon" aria-label="Sign out" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}
