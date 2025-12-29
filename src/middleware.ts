import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get('user');
  const { pathname } = request.nextUrl;

  // Allow requests for login page, API routes, and static files
  if (pathname.startsWith('/login') || pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.endsWith('.ico')) {
    return NextResponse.next();
  }

  // If no user cookie, redirect to login
  if (!userCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (image files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
