import { DatabaseService } from './database-service';

export class DownloadService {
  // Simple download with format conversion (MVP version)
  static async downloadSticker(
    sticker: { id: string; name: string; imageUrl: string },
    format: 'webp' | 'png' = 'webp'
  ) {
    try {
      // Track download first
      await this.trackDownload(sticker.id);

      if (format === 'webp') {
        // Convert to WebP for WhatsApp
        await this.downloadAsWebP(sticker);
      } else {
        // Regular PNG download
        await this.downloadAsFile(sticker, 'png');
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to direct download
      const link = document.createElement('a');
      link.href = sticker.imageUrl;
      link.download = `${sticker.name.replace(/\s+/g, '_')}_sticker.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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

  // Direct file download
  private static async downloadAsFile(
    sticker: { name: string; imageUrl: string },
    format: string
  ) {
    const response = await fetch(sticker.imageUrl);
    const blob = await response.blob();
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sticker.name.replace(/\s+/g, '_')}_sticker.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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