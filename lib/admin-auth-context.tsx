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
    setToken(null);
    setIsAuthenticated(false);
  };

  const login = (newToken: string) => {
    const now = Date.now();
    localStorage.setItem("admin_token", newToken);
    localStorage.setItem("admin_auth_time", now.toString());
    localStorage.setItem("admin_authenticated", "true"); // Backward compatibility
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