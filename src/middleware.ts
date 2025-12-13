import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_UID = 'admin@example.com'; // Mock admin user

const authMiddleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const userCookie = request.cookies.get('user');
  const user = userCookie ? JSON.parse(userCookie.value) : null;

  // If not logged in, redirect to login page, unless they are already on it
  if (!user && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user) {
    const isAdmin = user.uid === ADMIN_UID;
    
    // If on login page, redirect to appropriate dashboard
    if (pathname === '/login') {
        const url = isAdmin ? '/admin' : '/student';
        return NextResponse.redirect(new URL(url, request.url));
    }

    // Protect admin routes
    if (pathname.startsWith('/admin') && !isAdmin) {
      return NextResponse.redirect(new URL('/student', request.url));
    }

    // Protect student routes
    if (pathname.startsWith('/student') && isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
};

export default authMiddleware;

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
