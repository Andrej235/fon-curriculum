import { NextResponse, NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const allowedRoutes = ["/", "/raspored", "/raspored/"];
  if (allowedRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/raspored", request.url));
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|/?$).*)",
};
