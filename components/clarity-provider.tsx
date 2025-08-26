"use client";

import { useEffect } from "react";

export function ClarityProvider() {
  useEffect(() => {
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
  }, []);

  return null;
}
