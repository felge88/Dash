import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth-new";

export function middleware(request: NextRequest) {
  // Skip middleware for public routes
  const publicRoutes = ["/api/auth/login", "/login", "/_next", "/favicon.ico"];

  const pathname = request.nextUrl.pathname;

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check authentication for API routes
  if (pathname.startsWith("/api/")) {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Add user info to headers for downstream processing
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId.toString());
    requestHeaders.set("x-user-username", payload.username);
    requestHeaders.set("x-user-admin", payload.is_admin.toString());

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // For non-API routes, redirect to login if not authenticated
  if (pathname.startsWith("/dashboard")) {
    // This would need to check for client-side auth state
    // For now, let the client handle it
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*"],
};
