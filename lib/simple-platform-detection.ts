// Simple platform detection for MVP
export const SimplePlatformDetection = {
  isMobile: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
    
    return mobileKeywords.some(keyword => userAgent.includes(keyword));
  },

  getRecommendedFormat: (): 'webp' | 'png' => {
    // Mobile devices: WebP (smaller files, WhatsApp handles conversion)
    // Desktop: PNG (WhatsApp Web compatibility)
    return SimplePlatformDetection.isMobile() ? 'webp' : 'png';
  },

  getFormatDescription: (): string => {
    const format = SimplePlatformDetection.getRecommendedFormat();
    const platform = SimplePlatformDetection.isMobile() ? 'Mobile' : 'Desktop';
    
    return `${format.toUpperCase()} for ${platform}`;
  }
};