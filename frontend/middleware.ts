import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve auth cookies
  const accessToken = request.cookies.get("np_access_token")?.value;
  const isSuperadmin =
    request.cookies.get("np_is_superadmin")?.value === "true";

  // 1. Superadmin Route Protection
  if (pathname.startsWith("/admin")) {
    const isAdminLoginPage = pathname === "/admin/login";

    if (!isAdminLoginPage) {
      if (!accessToken || !isSuperadmin) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }
    } else if (accessToken && isSuperadmin) {
      // If already logged in as superadmin, visiting /admin/login takes to /admin
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // 2. Merchant Console Route Protection
  if (pathname.startsWith("/console")) {
    if (!accessToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Guest Only Routes: If already authenticated, redirect to /console (or /admin)
  if (pathname === "/login" || pathname === "/signup") {
    if (accessToken) {
      if (isSuperadmin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.redirect(new URL("/console", request.url));
    }
  }

  // 4. Inject Security Headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  return response;
}

export const config = {
  matcher: ["/console/:path*", "/admin/:path*", "/login", "/signup"],
};
