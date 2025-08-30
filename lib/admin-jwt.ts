import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Secret key'i Uint8Array'e çevir (jose için gerekli)
const secret = new TextEncoder().encode(JWT_SECRET);

export interface AdminTokenPayload {
  adminId: string;
  username: string;
  iat?: number;
  exp?: number;
  [key: string]: string | number | undefined; // Jose için index signature
}

export async function generateAdminToken(username: string): Promise<string> {
  const payload: AdminTokenPayload = {
    adminId: 'admin-' + Date.now(), // Basit admin ID
    username,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);

  return token;
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as AdminTokenPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export async function isValidAdminToken(token: string | null): Promise<boolean> {
  if (!token) return false;
  const payload = await verifyAdminToken(token);
  return payload !== null;
}