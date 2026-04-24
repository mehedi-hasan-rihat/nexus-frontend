import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/dashboard', '/campus/success', '/campus/cancel'];
const AUTH_ONLY = ['/login', '/signup'];
const AUTH_COOKIE = 'nexus_auth';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY.some((p) => pathname.startsWith(p));

  if (!isProtected && !isAuthOnly) return NextResponse.next();

  const authenticated = !!req.cookies.get(AUTH_COOKIE)?.value;

  if (isProtected && !authenticated)
    return NextResponse.redirect(new URL('/login', req.url));

  if (isAuthOnly && authenticated)
    return NextResponse.redirect(new URL('/dashboard', req.url));

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/campus/success', '/campus/cancel', '/login', '/signup'],
};
