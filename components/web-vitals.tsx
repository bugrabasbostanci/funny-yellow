'use client'

import { useEffect } from 'react'

// Extend Window interface for Microsoft Clarity
declare global {
  interface Window {
    clarity?: (action: string, event: string, data?: Record<string, unknown>) => void
  }
}

export function WebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Development'ta performans izlemeyi devre dışı bırak
    if (process.env.NODE_ENV === 'development') {
      console.log('🚫 WebVitals disabled in development mode');
      return;
    }

    // Simple performance logging for MVP
    const logVital = (name: string, value: number) => {
      // Log to console for development
      console.log(`[WebVitals] ${name}:`, value)
      
      // Send to Microsoft Clarity if available
      if (typeof window.clarity === 'function') {
        window.clarity('event', 'web-vital', { metric: name, value })
      }
    }

    // Measure basic performance metrics
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          logVital('DOMContentLoaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart)
          logVital('LoadComplete', navEntry.loadEventEnd - navEntry.loadEventStart)
        }
        
        if (entry.entryType === 'largest-contentful-paint') {
          logVital('LCP', entry.startTime)
        }
        
        if (entry.entryType === 'first-input') {
          const fidEntry = entry as PerformanceEventTiming
          logVital('FID', fidEntry.processingStart - fidEntry.startTime)
        }
        
        if (entry.entryType === 'layout-shift' && !('hadRecentInput' in entry && entry.hadRecentInput)) {
          logVital('CLS', 'value' in entry ? entry.value as number : 0)
        }
      }
    })

    // Observe different entry types
    try {
      observer.observe({ type: 'navigation', buffered: true })
      observer.observe({ type: 'largest-contentful-paint', buffered: true })
      observer.observe({ type: 'first-input', buffered: true })
      observer.observe({ type: 'layout-shift', buffered: true })
    } catch {
      // Fallback for browsers that don't support all metrics
      console.log('[WebVitals] Some metrics not supported')
    }

    return () => observer.disconnect()
  }, [])

  return null
}