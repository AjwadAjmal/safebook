import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    username?: string;
    role?: string;
    householdId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      householdId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    role?: string;
    householdId?: string | null;
  }
}
