import NextAuth, { Session } from "next-auth";
import { authConfig } from "./auth.config";
import { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

interface AuthRequest extends NextRequest {
  auth: Session | null;
}

export const proxyLogic = (req: AuthRequest) => {
  const isLoggedin = !!req.auth;
  const { nextUrl } = req;

  const isPublicRoute = ["/login", "/register"].includes(nextUrl.pathname);
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");

  if (isApiAuthRoute) return;

  if (isPublicRoute) {
    if (isLoggedin) {
      return Response.redirect(new URL("/", nextUrl));
    }
    return;
  }

  if (!isLoggedin && !isPublicRoute) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  // Redirect to onboarding if user has no householdId
  if (isLoggedin && req.auth?.user && !req.auth.user.householdId && nextUrl.pathname !== "/onboarding") {
    return Response.redirect(new URL("/onboarding", nextUrl));
  }
};

export default auth(proxyLogic);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
