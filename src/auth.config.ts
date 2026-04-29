import type { NextAuthConfig } from "next-auth"; // 

export const authConfig = {
  pages: {                    // Weiterleitung an eigene Login-Seite, da wir keine Standard-Login-Seite von NextAuth verwenden
    signIn: "/login", 
  },
  callbacks: {    // Route leitet unangemeldete Benutzer auf die Login-Seite um und angemeldete Benutzer zurück zum Dashboard
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;                // Session Cookie vorhanden => Benutzer ist eingeloggt
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname === "/"; // Prüfen, ob der Benutzer auf einer geschützten Seite zugrefen möchte
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      } else if (isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl)); // Weiterleitung zum Dashboard
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.householdId = user.householdId;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.householdId = token.householdId as string;
      }
      return session;
    },
  },
  providers: [], // Wird in auth.ts überschrieben
} satisfies NextAuthConfig;
