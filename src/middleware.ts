import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    // 1. Admin Protection Logic
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Exclude the login page itself to avoid loops
        if (!request.nextUrl.pathname.startsWith('/admin/login')) {
            const adminCookie = request.cookies.get('admin_access_token')

            // Strict check: cookie must exist and have value 'true'
            if (!adminCookie || adminCookie.value !== 'true') {
                const url = request.nextUrl.clone()
                url.pathname = '/admin/login'
                return NextResponse.redirect(url)
            }
        }
    }

    // 2. Supabase Session Logic (Preserve existing auth flow)
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public assets)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
