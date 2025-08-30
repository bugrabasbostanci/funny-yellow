"use client";

import dynamic from "next/dynamic";
import React from "react";

// Lazy load providers for better performance
const ClarityProvider = dynamic(() => import("@/components/clarity-provider").then(mod => ({ default: mod.ClarityProvider })), {
  ssr: false,
});

const WebVitals = dynamic(() => import("@/components/web-vitals").then(mod => ({ default: mod.WebVitals })), {
  ssr: false,
});

const AdminAuthProvider = dynamic(() => import("@/lib/admin-auth-context").then(mod => ({ default: mod.AdminAuthProvider })), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50" />
});

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <AdminAuthProvider>
      <ClarityProvider />
      <WebVitals />
      {children}
    </AdminAuthProvider>
  );
}