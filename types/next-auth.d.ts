import { type DefaultSession } from "next-auth";
import { type JWT } from "next-auth/jwt";
import type { AdminStatus, Role } from "@/types/domain";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      username: string;
      role: Role;
      status: AdminStatus;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name: string;
    username: string;
    role: Role;
    status: AdminStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    username: string;
    role: Role;
    status: AdminStatus;
  }
}
