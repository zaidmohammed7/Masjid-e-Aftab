import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login');
  
  // Basic security: In a real app use JWT or NextAuth
  const hasAuthToken = request.cookies.has('admin_auth');

  if (isAdminPath && !hasAuthToken) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
