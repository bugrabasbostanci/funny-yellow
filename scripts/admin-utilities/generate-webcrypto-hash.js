// Edge Runtime compatible password hash generator
const crypto = require('crypto');

const password = 'admin123';

async function hashPassword(password, salt) {
  // Password + salt birleştir
  const passwordBytes = Buffer.from(password + salt, 'utf8');
  
  // SHA-256 hash oluştur
  let hash = crypto.createHash('sha256').update(passwordBytes).digest();
  
  // 10.000 round PBKDF2 benzeri güçlendirme
  for (let i = 0; i < 10000; i++) {
    const combined = Buffer.concat([hash, passwordBytes]);
    hash = crypto.createHash('sha256').update(combined).digest();
  }
  
  return hash.toString('hex');
}

async function generateCredentials() {
  try {
    // Random salt oluştur
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await hashPassword(password, salt);
    
    console.log('\n🔐 Generated Web Crypto Compatible Hash:');
    console.log('ADMIN_PASSWORD_HASH=' + hash);
    console.log('ADMIN_PASSWORD_SALT=' + salt);
    console.log('\n⚠️  Copy these values to your .env.local file');
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

generateCredentials();