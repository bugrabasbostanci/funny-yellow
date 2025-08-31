"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ClarityProvider() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Disable Clarity on admin pages
    if (pathname.startsWith('/admin')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚫 Clarity disabled for admin pages');
      }
      return;
    }
    const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
    
    if (!projectId) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Clarity project ID not found in environment variables');
      }
      return;
    }

    // Dynamic import to ensure client-side only and avoid SSR issues
    import('@microsoft/clarity').then((clarity) => {
      clarity.default.init(projectId);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Microsoft Clarity initialized with project:', projectId);
      }
    }).catch((error) => {
      console.error('❌ Failed to initialize Clarity:', error);
    });
  }, [pathname]);

  return null;
}
