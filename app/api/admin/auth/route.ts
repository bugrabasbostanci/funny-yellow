import { NextRequest, NextResponse } from 'next/server';
import { generateAdminToken } from '@/lib/admin-jwt';
import { verifyPassword } from '@/lib/password-hash';

export const runtime = 'edge';

// Basit rate limiting (memory-based)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 dakika

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);
  
  if (!attempt) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Lockout süresi geçtiyse sıfırla
  if (now - attempt.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Max attempt aşıldıysa
  if (attempt.count >= MAX_ATTEMPTS) {
    return false;
  }
  
  // Deneme sayısını artır
  attempt.count++;
  attempt.lastAttempt = now;
  loginAttempts.set(ip, attempt);
  
  return true;
}

function clearLoginAttempts(ip: string) {
  loginAttempts.delete(ip);
}

export async function POST(request: NextRequest) {
  try {
    // IP adresini al (rate limiting için)
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';
    
    // Rate limiting kontrolü
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const adminPasswordSalt = process.env.ADMIN_PASSWORD_SALT;

    if (!adminUsername || !adminPasswordHash || !adminPasswordSalt) {
      console.error('Admin credentials not configured in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Username ve password hash kontrolü
    const isUsernameValid = username === adminUsername;
    const isPasswordValid = await verifyPassword(password, adminPasswordHash, adminPasswordSalt);

    if (isUsernameValid && isPasswordValid) {
      // Başarılı giriş - rate limit temizle
      clearLoginAttempts(clientIP);
      
      // JWT token oluştur (async)
      const token = await generateAdminToken(username);
      
      return NextResponse.json({
        success: true,
        token,
        timestamp: Date.now()
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Admin auth API error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}