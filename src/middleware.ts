import { NextResponse } from "next/server";
import {
  apiAuthPrefix,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  privateRoutes,
} from "./routes";
import { authConfig } from "@/auth.config";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);

export default auth(function middleware(req) {
  const { nextUrl } = req;

  const isLoggedIn = !!req.auth;

  const pathname = nextUrl.pathname;

  if (pathname.startsWith(apiAuthPrefix)) return NextResponse.next();

  const isAuthRoute = authRoutes.includes(pathname);
  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isLoggedIn && isAuthRoute)
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));

  if (!isLoggedIn && isPrivateRoute) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
