import NextAuth from "next-auth";    // Hauptbibliothek für Authentifizierung
import Credentials from "next-auth/providers/credentials";
import { validateCredentials } from "@/lib/auth-utils";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      ...authConfig.providers[0],
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await validateCredentials(
          credentials.username as string,
          credentials.password as string
        );

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          name: user.username,
          role: user.role,
          householdId: user.householdId,
        };
      },
    }),
  ],
});
