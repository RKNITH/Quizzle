// src/middleware.js
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

// Initialize NextAuth with the Edge-compatible config
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  const protectedPrefixes = ['/dashboard', '/topics', '/quiz', '/results', '/leaderboard', '/profile'];
  const authPaths = ['/login', '/register'];

  const isProtected = protectedPrefixes.some(prefix => pathname.startsWith(prefix));
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)',
  ],
};