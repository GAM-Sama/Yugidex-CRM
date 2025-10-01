import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/profile") ||
    request.nextUrl.pathname.startsWith("/cards") ||
    request.nextUrl.pathname.startsWith("/statistics") ||
    request.nextUrl.pathname.startsWith("/settings")
  ) {
    return await updateSession(request)
  }

  return
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/cards/:path*", "/statistics/:path*", "/settings/:path*"],
}
