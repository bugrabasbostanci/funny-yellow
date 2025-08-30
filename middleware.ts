import { NextRequest, NextResponse } from 'next/server';
import { isValidAdminToken } from '@/lib/admin-jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin API rotalarını koru (auth endpoint hariç)
  const isAuthEndpoint = pathname === '/api/admin/auth' || pathname === '/api/admin/auth/';
  
  // Admin sayfalarını da koru (ana admin sayfası hariç)
  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin';
  const isAdminApiRoute = pathname.startsWith('/api/admin') && !isAuthEndpoint;
  
  if (isAdminApiRoute || isAdminPage) {
    console.log(`🔍 Middleware checking: ${pathname}`);
    
    let token: string | null = null;
    
    // API routes için Authorization header'dan token al
    if (isAdminApiRoute) {
      const authHeader = request.headers.get('authorization');
      token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    }
    
    // Admin sayfalar için cookie'den token al
    if (isAdminPage) {
      // First try Authorization header (for API-like requests)
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      } else {
        // Check for token in request headers or cookies
        // Since we can't access localStorage in middleware, we'll redirect to login
        // and let the client-side auth context handle the token validation
        const adminToken = request.cookies.get('admin_token')?.value;
        token = adminToken || null;
      }
      
      // For admin pages without cookie token, redirect to admin root for auth check
      if (!token) {
        console.log('❌ No token found for admin page, redirecting to auth');
        const url = new URL('/admin', request.url);
        return NextResponse.redirect(url);
      }
    }
    
    console.log(`📝 Auth header: ${isAdminApiRoute ? (request.headers.get('authorization') ? 'Present' : 'Missing') : 'N/A'}`);
    console.log(`🎫 Token: ${token ? 'Present' : 'Missing'}`);

    if (!token) {
      console.log('❌ No token provided');
      if (isAdminApiRoute) {
        return NextResponse.json(
          { error: 'Unauthorized - No token provided', path: pathname },
          { status: 401 }
        );
      } else {
        // Redirect admin pages to login
        const url = new URL('/admin', request.url);
        return NextResponse.redirect(url);
      }
    }

    const isValid = await isValidAdminToken(token);
    console.log(`✅ Token valid: ${isValid}`);

    if (!isValid) {
      console.log('❌ Invalid token');
      if (isAdminApiRoute) {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid token', path: pathname },
          { status: 401 }
        );
      } else {
        // Clear invalid cookie and redirect to login
        const response = NextResponse.redirect(new URL('/admin', request.url));
        response.cookies.delete('admin_token');
        return response;
      }
    }
    
    console.log('✅ Auth successful for:', pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/admin/:path*',     // Tüm admin API rotaları
    '/admin/gallery/:path*', // Admin gallery sayfaları
    '/admin/upload/:path*',  // Admin upload sayfaları  
    '/admin/scripts/:path*', // Admin scripts sayfaları
    '/admin/packs/:path*',   // Admin packs sayfaları
  ],
};