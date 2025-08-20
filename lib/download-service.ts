import { DatabaseService } from './database-service';
import { PlatformDetection } from './platform-detection';

export class DownloadService {
  // Smart download with format optimization and platform detection
  static async downloadSticker(
    sticker: { id: string; name: string; imageUrl: string },
    format?: 'webp' | 'png'
  ) {
    try {
      // Track download first
      await this.trackDownload(sticker.id);

      // Use platform detection if format not specified
      const targetFormat = format || PlatformDetection.getPlatformInfo().recommendedFormat;
      
      // Try to get optimized version first
      const optimizedUrl = await this.getOptimizedStickerUrl(sticker.imageUrl, targetFormat);
      
      if (optimizedUrl) {
        // Download pre-optimized version
        await this.downloadAsFile({ ...sticker, imageUrl: optimizedUrl }, targetFormat);
      } else {
        // Fallback to client-side conversion
        if (targetFormat === 'webp') {
          await this.downloadAsWebP(sticker);
        } else {
          await this.downloadAsPNG(sticker);
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to direct download
      await this.fallbackDownload(sticker);
    }
  }

  // Try to find pre-optimized version of the sticker
  private static async getOptimizedStickerUrl(originalUrl: string, format: 'webp' | 'png'): Promise<string | null> {
    try {
      // Extract filename from original URL
      const urlParts = originalUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const baseFilename = filename.replace(/\.[^/.]+$/, ""); // Remove extension
      
      // Try different optimized paths
      const possiblePaths = [
        `/stickers/${format}/${baseFilename}.${format}`,
        `/stickers/webp/${baseFilename}.webp`,
        `/stickers/source/${filename}`,
      ];

      for (const path of possiblePaths) {
        if (await this.urlExists(path)) {
          return path;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding optimized version:', error);
      return null;
    }
  }

  // Check if URL exists
  private static async urlExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Enhanced fallback download with better error handling
  private static async fallbackDownload(sticker: { name: string; imageUrl: string }) {
    const link = document.createElement('a');
    link.href = sticker.imageUrl;
    link.download = `${sticker.name.replace(/\s+/g, '_')}_sticker.png`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Convert and download as WebP (WhatsApp format)
  private static async downloadAsWebP(sticker: { name: string; imageUrl: string }) {
    return new Promise<void>((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = 512;
      canvas.height = 512;

      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Clear canvas with transparent background
        ctx.clearRect(0, 0, 512, 512);

        // Calculate dimensions to fit image while maintaining aspect ratio
        const aspectRatio = img.width / img.height;
        let drawWidth = 512;
        let drawHeight = 512;
        let offsetX = 0;
        let offsetY = 0;

        if (aspectRatio > 1) {
          // Landscape
          drawHeight = 512 / aspectRatio;
          offsetY = (512 - drawHeight) / 2;
        } else {
          // Portrait or square
          drawWidth = 512 * aspectRatio;
          offsetX = (512 - drawWidth) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${sticker.name.replace(/\s+/g, '_')}_sticker.webp`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              resolve();
            } else {
              reject(new Error('Failed to create WebP blob'));
            }
          },
          'image/webp',
          0.9
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = sticker.imageUrl;
    });
  }

  // Convert and download as PNG with transparency optimization
  private static async downloadAsPNG(sticker: { name: string; imageUrl: string }) {
    return new Promise<void>((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = 512;
      canvas.height = 512;

      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Clear canvas with transparent background
        ctx.clearRect(0, 0, 512, 512);

        // Calculate dimensions to fit image while maintaining aspect ratio
        const aspectRatio = img.width / img.height;
        let drawWidth = 512;
        let drawHeight = 512;
        let offsetX = 0;
        let offsetY = 0;

        if (aspectRatio > 1) {
          // Landscape
          drawHeight = 512 / aspectRatio;
          offsetY = (512 - drawHeight) / 2;
        } else {
          // Portrait or square
          drawWidth = 512 * aspectRatio;
          offsetX = (512 - drawWidth) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${sticker.name.replace(/\s+/g, '_')}_sticker.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              resolve();
            } else {
              reject(new Error('Failed to create PNG blob'));
            }
          },
          'image/png'
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = sticker.imageUrl;
    });
  }

  // Direct file download with better error handling
  private static async downloadAsFile(
    sticker: { name: string; imageUrl: string },
    format: string
  ) {
    try {
      const response = await fetch(sticker.imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sticker.name.replace(/\s+/g, '_')}_sticker.${format}`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up after a delay to ensure download starts
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('Direct download failed:', error);
      // Fallback to basic link download
      const link = document.createElement('a');
      link.href = sticker.imageUrl;
      link.download = `${sticker.name.replace(/\s+/g, '_')}_sticker.${format}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Track download for analytics
  private static async trackDownload(stickerId: string) {
    try {
      // Get client IP (simplified for MVP)
      const ipAddress = await this.getClientIP();
      const userAgent = navigator.userAgent;

      await DatabaseService.trackDownload(stickerId, ipAddress, userAgent);
    } catch (error) {
      console.error('Failed to track download:', error);
      // Don't block download if tracking fails
    }
  }

  // Simple client IP detection (MVP version)
  private static async getClientIP(): Promise<string> {
    try {
      // Use a simple fallback IP for MVP
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  // Bulk download for sticker packs
  static async downloadStickerPack(
    stickers: Array<{ id: string; name: string; imageUrl: string }>
  ) {
    const downloads = stickers.map((sticker, index) => 
      new Promise<void>((resolve) => {
        setTimeout(async () => {
          try {
            await this.downloadSticker(sticker, 'webp');
            resolve();
          } catch (error) {
            console.error(`Failed to download ${sticker.name}:`, error);
            resolve(); // Continue with other downloads
          }
        }, index * 500); // Stagger downloads
      })
    );

    await Promise.all(downloads);

    // Show completion message
    const message = `Downloaded ${stickers.length} stickers for WhatsApp!`;
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Download Complete', { body: message });
    } else {
      console.log(message);
    }
  }
}