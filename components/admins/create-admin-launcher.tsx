"use client";

import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateAdminForm } from "@/components/admins/create-admin-form";
import { cn } from "@/lib/utils/cn";

export function CreateAdminLauncher() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  function close() {
    setClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 180);
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} className="w-full sm:w-auto">
        <UserPlus className="h-4 w-4" aria-hidden="true" />
        Add admin
      </Button>
      {open ? (
        <div
          className={cn(
            "fixed inset-0 z-50 bg-foreground/40 p-4 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none",
            closing ? "opacity-0" : "opacity-100"
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-admin-title"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) close();
          }}
        >
          <div
            className={cn(
              "mx-auto mt-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-soft transition-transform duration-200 ease-out motion-reduce:transition-none sm:mt-20",
              closing ? "translate-y-2 scale-[0.98]" : "translate-y-0 scale-100"
            )}
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h2 id="create-admin-title" className="font-display text-xl font-bold">Create Booking Admin</h2>
                <p className="mt-1 text-sm text-muted-foreground">Temporary passwords are shown once. Staff must save it securely.</p>
              </div>
              <Button type="button" variant="ghost" size="icon" aria-label="Close create admin panel" onClick={close}>
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
            <div className="p-5">
              <CreateAdminForm />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
