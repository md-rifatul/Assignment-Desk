import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isTeacherRoute = pathname.startsWith("/teacher");
  const isStudentRoute = pathname.startsWith("/student");
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/activate-account" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/";

  if (!token) {
    if (isAdminRoute || isTeacherRoute || isStudentRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // If requesting home and no token, redirect to login
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) {
      throw new Error("Invalid token format");
    }
    
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = atob(base64);
    const parsed = JSON.parse(jsonPayload);
    
    const role =
      parsed.role ||
      parsed["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const exp = parsed.exp;

    // Check token expiration
    if (exp && exp * 1000 < Date.now()) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("auth_token");
      return response;
    }

    // Role-based route guard
    if (isAdminRoute && role !== "Admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (isTeacherRoute && role !== "Teacher") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (isStudentRoute && role !== "Student") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // If authenticated and visiting root or auth routes, redirect to their dashboard
    if (isAuthRoute) {
      if (role === "Admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else if (role === "Teacher") {
        return NextResponse.redirect(new URL("/teacher/dashboard", request.url));
      } else if (role === "Student") {
        return NextResponse.redirect(new URL("/student/dashboard", request.url));
      }
    }
  } catch {
    // Clear cookie on exception
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth_token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/login",
    "/forgot-password",
    "/reset-password",
    "/activate-account",
  ],
};
