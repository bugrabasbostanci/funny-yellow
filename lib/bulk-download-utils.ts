import JSZip from 'jszip';
import { WhatsAppStickerService } from './whatsapp-integration';

export interface StickerForDownload {
  id: string;
  name: string;
  tags: string[];
  imageUrl: string;
}

export interface BulkDownloadOptions {
  format: 'zip' | 'whatsapp-pack' | 'individual';
  packName?: string;
}

export class BulkDownloadService {
  
  static async downloadAsZip(
    stickers: StickerForDownload[], 
    packName: string = 'My Stickers',
    format: 'webp' | 'png' = 'png'
  ): Promise<void> {
    if (stickers.length === 0) {
      throw new Error('No stickers selected for download');
    }

    const zip = new JSZip();
    const errors: string[] = [];

    // Progress tracking
    let completed = 0;
    const total = stickers.length;

    try {
      // Download all stickers and add to ZIP (flat structure)
      const downloadPromises = stickers.map(async (sticker) => {
        try {
          console.log(`🔍 Downloading sticker: ${sticker.name} from URL: ${sticker.imageUrl}`);
          const response = await fetch(sticker.imageUrl);
          if (!response.ok) {
            console.error(`❌ Failed to fetch sticker ${sticker.name}: ${response.status} - ${response.statusText}`);
            throw new Error(`Failed to fetch: ${response.status} - ${response.statusText}`);
          }
          
          const blob = await response.blob();
          const sanitizedName = this.sanitizeFileName(sticker.name);
          const fileName = `${sanitizedName}.${format}`;
          
          // Add directly to ZIP root (no folders)
          zip.file(fileName, blob);
          
          completed++;
          
          // Dispatch progress event
          window.dispatchEvent(new CustomEvent('bulkDownloadProgress', {
            detail: { completed, total, current: sticker.name }
          }));
          
        } catch (error) {
          errors.push(`${sticker.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });

      await Promise.all(downloadPromises);

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${packName.replace(/[^a-zA-Z0-9]/g, '_')}_stickers.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

    } catch (error) {
      throw new Error(`Failed to create ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async downloadAsWhatsAppPack(
    stickers: StickerForDownload[],
    packName: string = 'My Sticker Pack'
  ): Promise<void> {
    if (stickers.length === 0) {
      throw new Error('No stickers selected for download');
    }

    if (stickers.length > 30) {
      throw new Error('WhatsApp packs can contain maximum 30 stickers. Please select fewer stickers.');
    }

    try {
      const stickerPack = await WhatsAppStickerService.createStickerPack(stickers, packName);
      await WhatsAppStickerService.downloadStickerPack(stickerPack);
    } catch (error) {
      throw new Error(`Failed to create WhatsApp pack: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static getFileExtension(url: string): string | null {
    try {
      const pathname = new URL(url).pathname;
      const extension = pathname.split('.').pop()?.toLowerCase();
      return extension || null;
    } catch {
      return null;
    }
  }

  static sanitizeFileName(name: string): string {
    // Replace spaces and special characters with underscores, keep only safe characters
    return name
      .replace(/[^a-zA-Z0-9\s\-_.]/g, '') // Remove unsafe characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .toLowerCase()
      .slice(0, 50); // Limit length to 50 characters
  }


  static validateSelection(stickers: StickerForDownload[]): {
    isValid: boolean;
    error?: string;
  } {
    if (stickers.length === 0) {
      return { isValid: false, error: 'No stickers selected' };
    }

    // No validation needed - all formats support any number of stickers

    return { isValid: true };
  }

  static async downloadIndividualStickers(
    stickers: StickerForDownload[],
    format: 'webp' | 'png' = 'png'
  ): Promise<void> {
    if (stickers.length === 0) {
      throw new Error('No stickers selected for download');
    }

    let completed = 0;
    const total = stickers.length;
    const errors: string[] = [];

    // Sequential download with user-friendly delays to avoid browser blocking
    for (let i = 0; i < stickers.length; i++) {
      const sticker = stickers[i];
      
      try {
        // Update progress
        window.dispatchEvent(new CustomEvent('bulkDownloadProgress', {
          detail: { completed, total, current: `Downloading ${sticker.name}...` }
        }));

        console.log(`🔍 Individual download: ${sticker.name} from URL: ${sticker.imageUrl}`);
        const response = await fetch(sticker.imageUrl);
        if (!response.ok) {
          console.error(`❌ Failed to fetch sticker ${sticker.name}: ${response.status} - ${response.statusText}`);
          throw new Error(`Failed to fetch: ${response.status} - ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const sanitizedName = this.sanitizeFileName(sticker.name);
        const fileName = `${sanitizedName}.${format}`;
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        completed++;
        
        // Update progress
        window.dispatchEvent(new CustomEvent('bulkDownloadProgress', {
          detail: { completed, total, current: `Downloaded ${sticker.name}` }
        }));
        
        // Small delay between downloads to be browser-friendly
        if (i < stickers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
      } catch (error) {
        errors.push(`${sticker.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        completed++;
        
        window.dispatchEvent(new CustomEvent('bulkDownloadProgress', {
          detail: { completed, total, current: `Failed: ${sticker.name}` }
        }));
      }
    }

    // Show completion message
    if (errors.length === 0) {
      window.dispatchEvent(new CustomEvent('bulkDownloadProgress', {
        detail: { completed, total, current: `All ${total} stickers downloaded!` }
      }));
    } else {
      console.warn(`Successfully downloaded ${total - errors.length}/${total} stickers. ${errors.length} failed.`);
    }
  }

  static getRecommendedFormat(stickerCount: number): 'zip' | 'whatsapp-pack' | 'individual' {
    if (stickerCount <= 5) return 'individual';
    if (stickerCount <= 30) return 'whatsapp-pack';
    return 'zip';
  }
}