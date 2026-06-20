import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

export function DataNotice({ title = "Data connection issue", message }: { title?: string; message: string }) {
  return (
    <Card className="border-amber-300 bg-status-pending/10 p-4 text-amber-900 dark:text-amber-100">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6">{message}</p>
        </div>
      </div>
    </Card>
  );
}
