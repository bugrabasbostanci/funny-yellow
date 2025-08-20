// Image optimization utilities for Funny Yellow

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'png' | 'jpg';
  blur?: number;
}

export class ImageOptimizer {
  private static readonly SUPABASE_BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // Generate optimized image URL with Next.js Image Optimization API
  static getOptimizedUrl(
    originalUrl: string,
    options: ImageOptimizationOptions = {}
  ): string {
    if (!originalUrl || originalUrl.startsWith('/')) {
      // Local images don't need URL optimization
      return originalUrl;
    }

    const {
      width,
      height,
      quality = 85,
      format,
    } = options;

    // For Supabase images, we can use their transformation API
    if (originalUrl.includes('supabase.co/storage')) {
      const url = new URL(originalUrl);
      const searchParams = new URLSearchParams();
      
      if (width) searchParams.set('width', width.toString());
      if (height) searchParams.set('height', height.toString());
      if (quality) searchParams.set('quality', quality.toString());
      if (format) searchParams.set('format', format);
      
      url.search = searchParams.toString();
      return url.toString();
    }

    return originalUrl;
  }

  // Generate responsive image sources for different screen sizes
  static getResponsiveSources(originalUrl: string): Array<{
    srcSet: string;
    sizes: string;
    media?: string;
  }> {
    const sources = [];

    // Mobile
    sources.push({
      srcSet: `${this.getOptimizedUrl(originalUrl, { width: 256, quality: 80 })} 256w, ${this.getOptimizedUrl(originalUrl, { width: 384, quality: 80 })} 384w`,
      sizes: '(max-width: 640px) 50vw',
      media: '(max-width: 640px)',
    });

    // Tablet
    sources.push({
      srcSet: `${this.getOptimizedUrl(originalUrl, { width: 384, quality: 85 })} 384w, ${this.getOptimizedUrl(originalUrl, { width: 512, quality: 85 })} 512w`,
      sizes: '(max-width: 1024px) 33vw',
      media: '(max-width: 1024px)',
    });

    // Desktop
    sources.push({
      srcSet: `${this.getOptimizedUrl(originalUrl, { width: 512, quality: 90 })} 512w`,
      sizes: '25vw',
    });

    return sources;
  }

  // Generate blur data URL for placeholder
  static generateBlurDataUrl(width: number = 32, height: number = 32): string {
    // Simple base64 encoded tiny WebP for blur placeholder
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create gradient background similar to our sticker cards
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#fefce8'); // yellow-50
      gradient.addColorStop(1, '#fed7aa'); // orange-100
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    
    return canvas.toDataURL('image/webp', 0.1);
  }

  // Preload critical images
  static preloadImage(url: string, priority: 'high' | 'low' = 'low'): void {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.fetchPriority = priority;
    
    document.head.appendChild(link);
  }

  // Lazy load images with Intersection Observer
  static createLazyLoader(): IntersectionObserver | null {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return null;
    }

    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
            }
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1,
      }
    );
  }

  // Calculate optimal image dimensions based on container
  static calculateOptimalSize(
    containerWidth: number,
    containerHeight: number,
    originalWidth: number,
    originalHeight: number
  ): { width: number; height: number } {
    const containerAspectRatio = containerWidth / containerHeight;
    const imageAspectRatio = originalWidth / originalHeight;

    let width: number, height: number;

    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider than container
      width = containerWidth;
      height = containerWidth / imageAspectRatio;
    } else {
      // Image is taller than container or same aspect ratio
      height = containerHeight;
      width = containerHeight * imageAspectRatio;
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  // Check if image format is supported by browser
  static isFormatSupported(format: string): boolean {
    if (typeof window === 'undefined') return false;

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    return canvas.toDataURL(`image/${format}`, 0.5).startsWith(`data:image/${format}`);
  }

  // Get the best supported format for current browser
  static getBestFormat(): 'avif' | 'webp' | 'png' {
    if (this.isFormatSupported('avif')) return 'avif';
    if (this.isFormatSupported('webp')) return 'webp';
    return 'png';
  }

  // Convert file size to human readable format
  static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  }

  // Estimate bandwidth and adjust quality accordingly
  static getQualityBasedOnConnection(): number {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return 85; // Default quality
    }

    const connection = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
    const effectiveType = connection?.effectiveType;

    switch (effectiveType) {
      case 'slow-2g':
        return 60;
      case '2g':
        return 70;
      case '3g':
        return 80;
      case '4g':
      default:
        return 90;
    }
  }
}