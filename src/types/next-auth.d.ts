import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "member";
      householdId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: "admin" | "member";
    householdId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "admin" | "member";
    householdId: string | null;
  }
}
