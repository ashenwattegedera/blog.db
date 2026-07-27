import { NextResponse } from "next/server";

import { auth } from "@/auth";

// Optimistic route guard (Next.js 16 "proxy", formerly middleware). This is
// only a UX-level pre-filter — every Server Action still verifies the
// session independently (AGENTS.md security rule 2).
export default auth((req) => {
  const isLoggedIn = Boolean(req.auth);
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
