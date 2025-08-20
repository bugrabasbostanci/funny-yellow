"use client";

import Image from 'next/image';
import { useState } from 'react';
import { useAdaptiveLoading } from '@/hooks/use-image-performance';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality,
  fill = false,
  sizes,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const { recommendedQuality } = useAdaptiveLoading();
  
  // Use adaptive quality based on connection, but allow override
  const finalQuality = quality || recommendedQuality;

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  // Generate blur placeholder
  const blurDataURL = "data:image/webp;base64,UklGRnwBAABXRUJQVlA4IHABAABQCgCdASogACAAP3Gmy2KvKiWisAgB4JaJaU/gFd/kHa7x/QfN+kHz/pB+AP+APzGgDtdB82+Q/Qf8+f1JbY6dw";

  if (hasError) {
    return (
      <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground p-4">
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-sm">Image unavailable</div>
        </div>
      </div>
    );
  }

  const imageProps = {
    src,
    alt,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    priority,
    quality: finalQuality,
    placeholder: 'blur' as const,
    blurDataURL,
    onLoad: handleLoad,
    onError: handleError,
    ...(fill ? { fill: true } : { width, height }),
    ...(sizes && { sizes }),
  };

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''}`}>
      {isLoading && (
        <div className={`absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 animate-pulse ${fill ? 'w-full h-full' : ''}`} />
      )}
      <Image {...imageProps} alt={alt} />
    </div>
  );
}