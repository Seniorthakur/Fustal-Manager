import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Goal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { authOptions } from "@/lib/auth/auth-options";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.status === "active") redirect("/");
  const showDemoCredentials = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS !== "false";

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="absolute inset-x-0 top-0 h-64 pitch-header opacity-80" aria-hidden="true" />
      <Card className="relative w-full max-w-md overflow-hidden shadow-soft">
        <div className="h-2 bg-brand" />
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-card">
            <Goal className="h-7 w-7" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl">FutsalHQ Admin</CardTitle>
          <CardDescription>Internal booking control panel for owner and staff.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          {showDemoCredentials ? (
            <div className="mt-5 rounded-xl bg-muted p-3 text-xs leading-5 text-muted-foreground">
              Development seed login: <span className="font-semibold text-foreground">owner</span> / <span className="font-semibold text-foreground">ChangeMe123!</span>. Staff seed: <span className="font-semibold text-foreground">staff</span> / <span className="font-semibold text-foreground">StaffPass123!</span>.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
