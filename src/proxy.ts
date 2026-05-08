import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
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
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
