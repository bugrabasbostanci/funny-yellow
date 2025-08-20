"use client";

import { useState, useEffect, useCallback } from 'react';

interface ImageMetrics {
  loadTime: number;
  renderTime: number;
  fileSize?: number;
  compressionRatio?: number;
  format?: string;
}

interface UseImagePerformanceReturn {
  metrics: ImageMetrics | null;
  startTracking: () => void;
  endTracking: () => void;
  isTracking: boolean;
}

export function useImagePerformance(): UseImagePerformanceReturn {
  const [metrics, setMetrics] = useState<ImageMetrics | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const startTracking = useCallback(() => {
    setIsTracking(true);
    setStartTime(performance.now());
  }, []);

  const endTracking = useCallback(() => {
    if (startTime !== null) {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      setMetrics({
        loadTime,
        renderTime: loadTime, // For simplicity, using load time as render time
      });
      
      setIsTracking(false);
      setStartTime(null);
    }
  }, [startTime]);

  return {
    metrics,
    startTracking,
    endTracking,
    isTracking,
  };
}

// Hook for monitoring Core Web Vitals related to images
export function useImageWebVitals() {
  const [cls, setCLS] = useState<number>(0); // Cumulative Layout Shift
  const [lcp, setLCP] = useState<number>(0); // Largest Contentful Paint

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Monitor LCP (Largest Contentful Paint)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        startTime: number;
      };
      
      if (lastEntry) {
        setLCP(lastEntry.startTime);
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported
    }

    // Monitor CLS (Cumulative Layout Shift)
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      
      setCLS((prev) => prev + clsValue);
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // CLS not supported
    }

    return () => {
      observer.disconnect();
      clsObserver.disconnect();
    };
  }, []);

  return { cls, lcp };
}

// Hook for adaptive loading based on network conditions
export function useAdaptiveLoading() {
  const [connectionSpeed, setConnectionSpeed] = useState<string>('4g');
  const [saveData, setSaveData] = useState<boolean>(false);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const connection = (navigator as any).connection;
    
    if (connection) {
      setConnectionSpeed(connection.effectiveType || '4g');
      setSaveData(connection.saveData || false);
      
      const handleConnectionChange = () => {
        setConnectionSpeed(connection.effectiveType || '4g');
        setSaveData(connection.saveData || false);
      };
      
      connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        connection.removeEventListener('change', handleConnectionChange);
      };
    }
  }, []);

  // Determine if we should load high quality images
  const shouldLoadHighQuality = connectionSpeed === '4g' && !saveData;
  
  // Get recommended quality based on connection
  const getRecommendedQuality = (): number => {
    if (saveData) return 60;
    
    switch (connectionSpeed) {
      case 'slow-2g':
        return 50;
      case '2g':
        return 60;
      case '3g':
        return 75;
      case '4g':
      default:
        return 85;
    }
  };

  return {
    connectionSpeed,
    saveData,
    shouldLoadHighQuality,
    recommendedQuality: getRecommendedQuality(),
  };
}