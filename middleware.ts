import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected paths requiring authentication
const PROTECTED_PATHS = ['/'];
const AUTH_PATHS = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for Firebase auth session cookie
  const sessionCookie = request.cookies.get('firebase-auth-session');
  const isAuthenticated = !!sessionCookie?.value;

  // Redirect unauthenticated users from protected routes to login
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith('/(dashboard)')
  );

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect already authenticated users away from auth pages
  if (AUTH_PATHS.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
