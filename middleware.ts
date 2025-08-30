import { NextRequest, NextResponse } from 'next/server';
import { isValidAdminToken } from '@/lib/admin-jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin API rotalarını koru (auth endpoint hariç)
  const isAuthEndpoint = pathname === '/api/admin/auth' || pathname === '/api/admin/auth/';
  
  if (pathname.startsWith('/api/admin') && !isAuthEndpoint) {
    console.log(`🔍 Middleware checking: ${pathname}`);
    
    // Authorization header'dan token al
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    console.log(`📝 Auth header: ${authHeader ? 'Present' : 'Missing'}`);
    console.log(`🎫 Token: ${token ? 'Present' : 'Missing'}`);

    if (!token) {
      console.log('❌ No token provided');
      return NextResponse.json(
        { error: 'Unauthorized - No token provided', path: pathname },
        { status: 401 }
      );
    }

    const isValid = await isValidAdminToken(token);
    console.log(`✅ Token valid: ${isValid}`);

    if (!isValid) {
      console.log('❌ Invalid token');
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token', path: pathname },
        { status: 401 }
      );
    }
    
    console.log('✅ Auth successful for:', pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/admin/:path*', // Tüm admin API rotaları
  ],
};