import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAuthPage =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  const isPublicPage = pathname === "/" || isAuthPage;

  // Auth.js sometimes lands on the default sign-in route with ?error=MissingCSRF
  // after a failed logout on a bad host — send users to our custom page instead.
  if (pathname === "/api/auth/signin") {
    const url = new URL("/sign-in", req.url);
    const error = req.nextUrl.searchParams.get("error");
    if (error) url.searchParams.set("error", error);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  if (pathname === "/" && isLoggedIn) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  if (!isPublicPage && !pathname.startsWith("/api") && !isLoggedIn) {
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth") && !isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
