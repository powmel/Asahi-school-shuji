import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow requests for static files and API routes to pass through
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.endsWith('.ico') || pathname.endsWith('.png')) {
    return NextResponse.next();
  }

  // Allow access to login and signup pages
  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return NextResponse.next();
  }
  
  // To be implemented: check for firebase auth cookie
  // For now, allow access to other pages for development
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
