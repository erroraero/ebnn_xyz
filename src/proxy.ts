import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  // 1. Better Auth Session check
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session && request.nextUrl.pathname.startsWith("/guestbook")) {
    return NextResponse.redirect(new URL("/v2/oauth/social/Github/login", request.url));
  }

  // 2. Supabase Session Update
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
