"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-auth-context";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAdminAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Small delay to let auth context initialize and prevent race conditions
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        // Clear any stale auth data and redirect
        localStorage.removeItem("admin_authenticated");
        localStorage.removeItem("admin_auth_time");
        localStorage.removeItem("admin_token");
        document.cookie = 'admin_token=; Path=/; Max-Age=0; SameSite=Strict';
        router.push('/admin');
      }
      setIsChecking(false);
    }, 200); // Slightly longer delay to ensure auth context has initialized

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  if (isChecking) {
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