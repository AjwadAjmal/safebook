import NextAuth, { Session } from "next-auth";
import { authConfig } from "./auth.config";
import { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

interface AuthRequest extends NextRequest {
  auth: Session | null;
}

import { checkUserHasAccounts } from "./lib/account-db";

export const proxyLogic = async (req: AuthRequest, hasAccounts?: (userId: string) => Promise<boolean>) => {
  const isLoggedin = !!req.auth;
  const { nextUrl } = req;

  const isPublicRoute = ["/login"].includes(nextUrl.pathname);
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

  // Profile creation and household onboarding logic
  if (isLoggedin && req.auth?.user) {
    const userId = req.auth.user.id;
    // Verwende die übergebene Funktion oder die Standard-Funktion
    const checkFn = hasAccounts || checkUserHasAccounts;
    const hasAccs = await checkFn(userId);
    const hasHousehold = !!req.auth.user.householdId;

    if (!hasAccs) {
      if (nextUrl.pathname !== "/createprofile") {
        return Response.redirect(new URL("/createprofile", nextUrl));
      }
      return;
    }

    if (!hasHousehold) {
      if (nextUrl.pathname !== "/onboarding/household") {
        return Response.redirect(new URL("/onboarding/household", nextUrl));
      }
      return;
    }
  }
};

export default auth((req) => proxyLogic(req));

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
