import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip non-admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Skip login page
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get("koter-tutorials-session");
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
