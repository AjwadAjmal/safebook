import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "superadmin" | "admin" | "member";
      householdId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: "superadmin" | "admin" | "member";
    householdId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "superadmin" | "admin" | "member";
    householdId: string | null;
  }
}

