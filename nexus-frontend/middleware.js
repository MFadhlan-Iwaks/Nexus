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

function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function decodeJwtJson(part) {
  const bytes = base64UrlToBytes(part);
  const text = new TextDecoder().decode(bytes);
  return JSON.parse(text);
}

async function getVerifiedTokenPayload(token) {
  try {
    const [headerPart, payloadPart, signaturePart] = String(token || '').split('.');
    if (!headerPart || !payloadPart || !signaturePart) return null;

    const header = decodeJwtJson(headerPart);
    const payload = decodeJwtJson(payloadPart);

    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      return null;
    }

    if (process.env.JWT_SECRET) {
      if (header.alg !== 'HS256') return null;

      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(process.env.JWT_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      const isValid = await crypto.subtle.verify(
        'HMAC',
        key,
        base64UrlToBytes(signaturePart),
        new TextEncoder().encode(`${headerPart}.${payloadPart}`)
      );

      if (!isValid) return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value || '';
  const payload = await getVerifiedTokenPayload(token);
  const role = String(payload?.role || '').toLowerCase();
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
