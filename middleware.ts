import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

type Token = {
  email?: string | null;
  isAdmin?: boolean;
} | null;

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token as Token;
    const path = req.nextUrl.pathname;
    const isApi = path.startsWith("/api/");

    if (!token) {
      return isApi
        ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        : NextResponse.redirect(new URL("/", req.url));
    }

    if (!token?.isAdmin) {
      return isApi
        ? NextResponse.json({ error: "Forbidden" }, { status: 403 })
        : NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // We handle auth logic inside the middleware
      authorized: () => true,
    },
  },
);

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*"],
};
