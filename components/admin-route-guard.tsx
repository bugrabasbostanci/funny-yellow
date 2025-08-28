"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
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
          // Auth expired, clear storage and redirect
          localStorage.removeItem("admin_authenticated");
          localStorage.removeItem("admin_auth_time");
          router.push("/");
        }
      } else {
        // Not authenticated, redirect to home
        router.push("/");
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-yellow-600/60 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-yellow-600/60 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-yellow-600/60 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
          <p className="text-gray-600 mt-4">Yetki kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router.push will handle the redirect
  }

  return <>{children}</>;
}