import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { authSecret } from "@/lib/auth/shared-secret";

const superOnlyPrefixes = ["/admins", "/settings"];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (token?.status !== "active") {
      const login = new URL("/login", req.url);
      login.searchParams.set("error", "inactive");
      return NextResponse.redirect(login);
    }

    if (superOnlyPrefixes.some((prefix) => pathname.startsWith(prefix)) && token?.role !== "super_admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    secret: authSecret,
    pages: { signIn: "/login" },
    callbacks: {
      authorized: ({ token }) => Boolean(token)
    }
  }
);

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)"]
};
