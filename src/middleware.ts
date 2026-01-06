import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // 1. Handle Auth Session
  const response = await updateSession(request)

  // 2. Read Theme & Brand preferences from Cookies (or set defaults if missing)
  // Note: We don't set defaults here to avoid overwriting user logic, 
  // but we can ensure headers are passed if needed.
  // Actually, layout.tsx can read cookies directly.
  // But if we wanted to enforce a default theme for new visitors based on headers:
  
  if (!request.cookies.has('theme')) {
     // Optional: Detect system preference or default to light
     // response.cookies.set('theme', 'light') 
     // (We usually avoid setting cookies on every request unless necessary)
  }

  // Pass request headers to layout if we were doing header-based logic, 
  // but App Router `cookies()` is sufficient.

  return response
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
