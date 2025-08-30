// Script to generate bcrypt hash for admin password
const bcrypt = require('bcryptjs');

const password = 'admin123'; // Şifreyi buraya yazın
const saltRounds = 12; // Güvenlik seviyesi

async function generateHash() {
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('\n🔐 Generated Admin Password Hash:');
    console.log('ADMIN_PASSWORD_HASH=' + hash);
    console.log('\n⚠️  Copy this hash to your .env.local file');
    console.log('⚠️  Remove ADMIN_PASSWORD and ADMIN_PASSWORD_SALT from .env.local');
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

generateHash();