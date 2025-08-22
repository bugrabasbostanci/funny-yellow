"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const authState = localStorage.getItem("admin_authenticated");
    const authTime = localStorage.getItem("admin_auth_time");
    
    if (authState === "true" && authTime) {
      // Check if auth is still valid (24 hours)
      const now = Date.now();
      const authTimestamp = parseInt(authTime);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - authTimestamp < twentyFourHours) {
        setIsAuthenticated(true);
      } else {
        // Auth expired, clear storage
        localStorage.removeItem("admin_authenticated");
        localStorage.removeItem("admin_auth_time");
      }
    }
  }, []);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_auth_time");
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>
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