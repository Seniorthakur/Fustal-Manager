import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { adminsRepository } from "@/lib/repositories/admins-repository";
import { verifyPassword } from "./password";
import { isLoginLocked, recordLoginFailure, recordLoginSuccess } from "@/lib/security/login-rate-limit";
import { authSecret } from "@/lib/auth/shared-secret";

function requestIp(req: { headers?: Record<string, string | string[] | undefined> } | undefined) {
  const forwarded = req?.headers?.["x-forwarded-for"];
  const realIp = req?.headers?.["x-real-ip"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded || (Array.isArray(realIp) ? realIp[0] : realIp) || "local";
  return String(raw).split(",")[0]?.trim() || "local";
}

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 12,
    updateAge: 60 * 5
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  providers: [
    CredentialsProvider({
      name: "Username and password",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        const username = credentials?.username?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!username || !password) return null;

        const rateLimitKey = `${requestIp(req)}:${username}`;
        if (isLoginLocked(rateLimitKey)) return null;

        let admin;
        try {
          admin = await adminsRepository.findByUsername(username);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (message.includes("does not exist") || message.includes("P2021") || message.includes("no such table")) {
            throw new Error("Database is not initialized. Stop the server, run npm run db:setup, then start again.");
          }
          throw error;
        }

        if (!admin || admin.status !== "active") {
          recordLoginFailure(rateLimitKey);
          return null;
        }

        const ok = await verifyPassword(password, admin.passwordHash);
        if (!ok) {
          recordLoginFailure(rateLimitKey);
          return null;
        }

        recordLoginSuccess(rateLimitKey);
        await adminsRepository.updateLastLogin(admin.id).catch(() => undefined);

        return {
          id: admin.id,
          name: admin.name,
          username: admin.username,
          role: admin.role,
          status: admin.status
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.username = user.username;
        token.role = user.role;
        token.status = user.status;
        return token;
      }

      if (token.id) {
        const freshAdmin = await adminsRepository.findById(String(token.id)).catch(() => null);
        if (!freshAdmin || freshAdmin.status !== "active") {
          token.status = "inactive";
          return token;
        }
        token.name = freshAdmin.name;
        token.username = freshAdmin.username;
        token.role = freshAdmin.role;
        token.status = freshAdmin.status;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id,
        name: token.name,
        username: token.username,
        role: token.role,
        status: token.status
      };
      return session;
    }
  }
};
