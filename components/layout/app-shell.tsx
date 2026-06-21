import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/require-session";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.status !== "active") redirect("/login");

  return (
    <div className="min-h-screen min-w-0 bg-background">
      <Sidebar role={user.role} />
      <Topbar name={user.name} role={user.role} />
      <main className="min-w-0 px-3 py-5 pb-24 sm:px-5 md:px-6 lg:ml-72 lg:px-8 lg:py-6">
        <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">{children}</div>
      </main>
    </div>
  );
}
