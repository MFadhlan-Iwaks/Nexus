import { NextResponse } from 'next/server';

const roleDashMap = {
  admin: '/admin/dashboard',
  masyarakat: '/masyarakat/dashboard',
  operator: '/operator/dashboard',
  trc: '/trc/dashboard',
};

function getRoleDashboard(role) {
  return roleDashMap[role] || '/auth';
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const roleCookie = request.cookies.get('role')?.value || '';
  const role = roleCookie.toLowerCase();
  const isAuthed = Boolean(role);

  if (pathname.startsWith('/auth')) {
    if (isAuthed) {
      return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
    }
    return NextResponse.next();
  }

  const isAdminRoute = pathname.startsWith('/admin');
  const isMasyarakatRoute = pathname.startsWith('/masyarakat');
  const isOperatorRoute = pathname.startsWith('/operator');
  const isTrcRoute = pathname.startsWith('/trc');

  const isProtectedRoute = isAdminRoute || isMasyarakatRoute || isOperatorRoute || isTrcRoute;
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!isAuthed) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  if (isAdminRoute && role !== 'admin') {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }

  if (isMasyarakatRoute && role !== 'masyarakat') {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }

  if (isOperatorRoute && role !== 'operator') {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }

  if (isTrcRoute && role !== 'trc') {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/masyarakat/:path*', '/operator/:path*', '/trc/:path*', '/auth/:path*'],
};
