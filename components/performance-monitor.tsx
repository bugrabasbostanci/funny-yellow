"use client";

import { useEffect } from 'react';
import { useImageWebVitals } from '@/hooks/use-image-performance';

interface PerformanceMonitorProps {
  enabled?: boolean;
  debug?: boolean;
}

export function PerformanceMonitor({ enabled = false, debug = false }: PerformanceMonitorProps) {
  const { cls, lcp } = useImageWebVitals();

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Log performance metrics periodically
    const logMetrics = () => {
      const metrics = {
        cls,
        lcp,
        fcp: 0, // First Contentful Paint
        tti: 0, // Time to Interactive
      };

      // Get FCP if available
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          metrics.fcp = fcpEntry.startTime;
        }
      }

      if (debug) {
        console.group('🚀 Performance Metrics');
        console.log('Cumulative Layout Shift (CLS):', metrics.cls.toFixed(3));
        console.log('Largest Contentful Paint (LCP):', `${metrics.lcp.toFixed(0)}ms`);
        console.log('First Contentful Paint (FCP):', `${metrics.fcp.toFixed(0)}ms`);
        console.groupEnd();
      }

      // Send to analytics (in production)
      if (process.env.NODE_ENV === 'production') {
        // Here you would send metrics to your analytics service
        // Example: analytics.track('performance_metrics', metrics);
      }
    };

    // Log metrics every 30 seconds
    const interval = setInterval(logMetrics, 30000);
    
    // Log initial metrics after 5 seconds
    const timeout = setTimeout(logMetrics, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [enabled, debug, cls, lcp]);

  // Don't render anything in production
  if (!debug) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded font-mono z-50 max-w-xs">
      <div className="space-y-1">
        <div>🎯 CLS: {cls.toFixed(3)}</div>
        <div>⚡ LCP: {lcp.toFixed(0)}ms</div>
        <div className={`text-${cls > 0.1 ? 'red' : cls > 0.05 ? 'yellow' : 'green'}-400`}>
          {cls <= 0.1 ? '✅' : cls <= 0.25 ? '⚠️' : '❌'} Layout Stability
        </div>
        <div className={`text-${lcp > 4000 ? 'red' : lcp > 2500 ? 'yellow' : 'green'}-400`}>
          {lcp <= 2500 ? '✅' : lcp <= 4000 ? '⚠️' : '❌'} Loading Speed
        </div>
      </div>
    </div>
  );
}