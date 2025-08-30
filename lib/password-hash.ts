// Edge Runtime compatible password hashing using Web Crypto API

export async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  // Salt oluştur veya mevcut salt'u kullan
  const actualSalt = salt || crypto.getRandomValues(new Uint8Array(16)).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
  
  // Password + salt birleştir
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password + actualSalt);
  
  // SHA-256 hash oluştur (multiple rounds için)
  let hash = await crypto.subtle.digest('SHA-256', passwordBytes);
  
  // 10.000 round PBKDF2 benzeri güçlendirme
  for (let i = 0; i < 10000; i++) {
    const combined = new Uint8Array(hash.byteLength + passwordBytes.byteLength);
    combined.set(new Uint8Array(hash));
    combined.set(passwordBytes, hash.byteLength);
    hash = await crypto.subtle.digest('SHA-256', combined);
  }
  
  // Hex string'e çevir
  const hashHex = Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return { hash: hashHex, salt: actualSalt };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  try {
    const computedHash = await hashPassword(password, salt);
    return computedHash.hash === hash;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}