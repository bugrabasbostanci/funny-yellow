"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  getAuthHeader: () => { Authorization: string } | Record<string, never>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // JWT token kontrol et
    const storedToken = localStorage.getItem("admin_token");
    const authTime = localStorage.getItem("admin_auth_time");
    
    if (storedToken && authTime) {
      // Token hala geçerlimi kontrol et (24 saat)
      const now = Date.now();
      const authTimestamp = parseInt(authTime);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - authTimestamp < twentyFourHours) {
        setToken(storedToken);
        setIsAuthenticated(true);
        // Eski format için backward compatibility
        localStorage.setItem("admin_authenticated", "true");
      } else {
        // Token expired, temizle
        clearAuth();
      }
    }
  }, []);

  const clearAuth = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_auth_time");
    localStorage.removeItem("admin_authenticated");
    
    // Clear the cookie
    document.cookie = 'admin_token=; Path=/; Max-Age=0; SameSite=Strict';
    
    setToken(null);
    setIsAuthenticated(false);
  };

  const login = (newToken: string) => {
    const now = Date.now();
    localStorage.setItem("admin_token", newToken);
    localStorage.setItem("admin_auth_time", now.toString());
    localStorage.setItem("admin_authenticated", "true"); // Backward compatibility
    
    // Set HTTP-only cookie for server-side validation
    // Note: This will be set as a regular cookie since we can't set HTTP-only from client
    // In production, consider handling this server-side
    document.cookie = `admin_token=${newToken}; Path=/; Max-Age=${24 * 60 * 60}; SameSite=Strict; Secure=${window.location.protocol === 'https:'}`;
    
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearAuth();
  };

  const getAuthHeader = (): { Authorization: string } | Record<string, never> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AdminAuthContext.Provider value={{ 
      isAuthenticated, 
      token, 
      login, 
      logout,
      getAuthHeader 
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}