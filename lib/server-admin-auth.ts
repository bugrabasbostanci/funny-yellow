import { cookies } from 'next/headers';
import { isValidAdminToken } from './admin-jwt';

export async function getServerSideAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) {
    return { isAuthenticated: false, token: null };
  }

  const isValid = await isValidAdminToken(token);
  return { 
    isAuthenticated: isValid, 
    token: isValid ? token : null 
  };
}

export async function requireServerSideAdminAuth() {
  const auth = await getServerSideAdminAuth();
  if (!auth.isAuthenticated) {
    throw new Error('Unauthorized access to admin resource');
  }
  return auth;
}