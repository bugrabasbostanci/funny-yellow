export interface PlatformInfo {
  isWhatsAppWeb: boolean;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'other';
  recommendedFormat: 'png' | 'webp';
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export class PlatformDetection {
  private static userAgent: string = '';
  
  static init(): void {
    if (typeof window !== 'undefined') {
      this.userAgent = navigator.userAgent.toLowerCase();
    }
  }

  static getPlatformInfo(): PlatformInfo {
    this.init();
    
    const isWhatsAppWeb = this.isWhatsAppWeb();
    const isMobile = this.isMobile();
    const isIOS = this.isIOS();
    const isAndroid = this.isAndroid();
    const isDesktop = this.isDesktop();
    const browser = this.getBrowser();
    const deviceType = this.getDeviceType();
    
    // Determine recommended format based on platform
    let recommendedFormat: 'png' | 'webp' = 'webp';
    
    // WhatsApp Web has issues with WebP uploads, prefer PNG
    if (isWhatsAppWeb) {
      recommendedFormat = 'png';
    }
    // iOS Safari has better PNG support for transparency
    else if (isIOS && browser === 'safari') {
      recommendedFormat = 'png';
    }
    // Desktop browsers generally handle both well, but PNG is safer for copy/paste
    else if (isDesktop) {
      recommendedFormat = 'png';
    }
    // Mobile devices generally prefer WebP for smaller file sizes
    else if (isMobile && (isAndroid || browser === 'chrome')) {
      recommendedFormat = 'webp';
    }

    return {
      isWhatsAppWeb,
      isMobile,
      isIOS,
      isAndroid,
      isDesktop,
      browser,
      recommendedFormat,
      deviceType,
    };
  }

  private static isWhatsAppWeb(): boolean {
    // Check for WhatsApp Web specific patterns
    return this.userAgent.includes('whatsapp') || 
           (window && window.location && window.location.hostname === 'web.whatsapp.com');
  }

  private static isMobile(): boolean {
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(this.userAgent) ||
           (window && window.screen && window.screen.width <= 768);
  }

  private static isIOS(): boolean {
    return /iphone|ipad|ipod/i.test(this.userAgent);
  }

  private static isAndroid(): boolean {
    return /android/i.test(this.userAgent);
  }

  private static isDesktop(): boolean {
    return !this.isMobile();
  }

  private static getBrowser(): PlatformInfo['browser'] {
    if (this.userAgent.includes('firefox')) return 'firefox';
    if (this.userAgent.includes('safari') && !this.userAgent.includes('chrome')) return 'safari';
    if (this.userAgent.includes('edg')) return 'edge';
    if (this.userAgent.includes('opera') || this.userAgent.includes('opr')) return 'opera';
    if (this.userAgent.includes('chrome')) return 'chrome';
    return 'other';
  }

  private static getDeviceType(): PlatformInfo['deviceType'] {
    if (this.isMobile()) {
      // Check if it's a tablet
      if (window && window.screen) {
        const { width, height } = window.screen;
        const screenSize = Math.max(width, height);
        if (screenSize >= 768) return 'tablet';
      }
      return 'mobile';
    }
    return 'desktop';
  }

  // Get user-friendly platform description
  static getPlatformDescription(): string {
    const info = this.getPlatformInfo();
    
    if (info.isWhatsAppWeb) {
      return 'WhatsApp Web';
    }
    
    if (info.isMobile) {
      if (info.isIOS) return 'iPhone/iPad';
      if (info.isAndroid) return 'Android Device';
      return 'Mobile Device';
    }
    
    return 'Desktop Browser';
  }

  // Get recommended download format with reasoning
  static getFormatRecommendation(): { format: 'png' | 'webp'; reason: string } {
    const info = this.getPlatformInfo();
    
    if (info.isWhatsAppWeb) {
      return {
        format: 'png',
        reason: 'WhatsApp Web works best with PNG format'
      };
    }
    
    if (info.isIOS && info.browser === 'safari') {
      return {
        format: 'png',
        reason: 'iOS Safari optimized for PNG transparency'
      };
    }
    
    if (info.isDesktop) {
      return {
        format: 'png',
        reason: 'Desktop browsers support copy/paste with PNG'
      };
    }
    
    if (info.isMobile) {
      return {
        format: 'webp',
        reason: 'Smaller file size for mobile devices'
      };
    }
    
    return {
      format: 'webp',
      reason: 'Modern format with better compression'
    };
  }

  // Check if device supports WebP
  static supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
      const webp = new Image();
      webp.onload = webp.onerror = () => {
        resolve(webp.height === 2);
      };
      webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  // Get platform-specific instructions
  static getDownloadInstructions(): string {
    const info = this.getPlatformInfo();
    
    if (info.isWhatsAppWeb) {
      return 'Download and drag the sticker into your WhatsApp chat, or use the share button to send directly.';
    }
    
    if (info.isMobile) {
      if (info.isIOS) {
        return 'Tap and hold the sticker, then save to photos. Open WhatsApp and use the sticker feature to add it.';
      }
      if (info.isAndroid) {
        return 'Download the sticker and open WhatsApp. Use the sticker feature to add your downloaded sticker.';
      }
      return 'Download and add to your messaging app\'s sticker collection.';
    }
    
    return 'Right-click to save the sticker to your computer, then drag into your messaging app or upload as needed.';
  }
}