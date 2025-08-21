export interface StickerPack {
  identifier: string;
  name: string;
  publisher: string;
  trayImageFile: string;
  publisherEmail?: string;
  publisherWebsite?: string;
  privacyPolicyWebsite?: string;
  licenseAgreementWebsite?: string;
  stickers: Sticker[];
}

export interface Sticker {
  imageFile: string;
  emojis: string[];
}

export class WhatsAppStickerService {
  static async createStickerPack(
    stickers: { id: string; name: string; category: string; imageUrl: string }[],
    packName: string
  ): Promise<StickerPack> {
    // Limit to 30 stickers as per WhatsApp requirements
    const limitedStickers = stickers.slice(0, 30);

    const stickerPack: StickerPack = {
      identifier: `funny_yellow_${Date.now()}`,
      name: packName,
      publisher: "Funny Yellow",
      trayImageFile: limitedStickers[0]?.imageUrl || "/placeholder.svg",
      publisherEmail: "hello@funnyyellow.com",
      publisherWebsite: "https://funnyyellow.com",
      privacyPolicyWebsite: "https://funnyyellow.com/privacy",
      licenseAgreementWebsite: "https://funnyyellow.com/terms",
      stickers: limitedStickers.map((sticker) => ({
        imageFile: sticker.imageUrl,
        emojis: this.getCategoryEmojis(sticker.category),
      })),
    };

    return stickerPack;
  }

  static getCategoryEmojis(category: string): string[] {
    const emojiMap: Record<string, string[]> = {
      // Actual categories from the database
      emotions: ["😊", "😢", "😡", "😴", "😍", "🥰"],
      reactions: ["👍", "👎", "😮", "😱", "👏", "🙌"],
      gestures: ["👋", "🤝", "👌", "✌️", "🤟", "🙏"],
      characters: ["👨", "👩", "🧑", "👶", "🧓", "👸"],
      // Default fallback
      Emotions: ["😊", "😢", "😡", "😴", "😍", "🥰"],
      Reactions: ["👍", "👎", "😮", "😱", "👏", "🙌"], 
      Gestures: ["👋", "🤝", "👌", "✌️", "🤟", "🙏"],
      Characters: ["👨", "👩", "🧑", "👶", "🧓", "👸"],
    };
    return emojiMap[category] || ["😊", "👍"];
  }

  static async convertToWebP(blob: Blob, name: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = 512;
      canvas.height = 512;
      
      // Create a temporary URL for the blob
      const blobUrl = URL.createObjectURL(blob);
      
      img.onload = () => {
        try {
          if (ctx) {
            // Clear canvas with transparent background
            ctx.clearRect(0, 0, 512, 512);
            
            // Calculate scaling to maintain aspect ratio
            const scale = Math.min(512 / img.width, 512 / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const x = (512 - scaledWidth) / 2;
            const y = (512 - scaledHeight) / 2;
            
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
            
            canvas.toBlob(
              (webpBlob) => {
                // Clean up the temporary URL
                URL.revokeObjectURL(blobUrl);
                
                if (webpBlob) {
                  resolve(webpBlob);
                } else {
                  reject(new Error(`Failed to convert ${name} to WebP`));
                }
              },
              'image/webp',
              0.9
            );
          } else {
            URL.revokeObjectURL(blobUrl);
            reject(new Error('Failed to get canvas context'));
          }
        } catch (error) {
          URL.revokeObjectURL(blobUrl);
          reject(new Error(`Error processing ${name}: ${error}`));
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        reject(new Error(`Failed to load image ${name}`));
      };
      
      // Set crossOrigin to handle CORS issues
      img.crossOrigin = 'anonymous';
      img.src = blobUrl;
    });
  }

  static async convertBlobToWebPDirect(blob: Blob, name: string): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        canvas.width = 512;
        canvas.height = 512;
        
        // Create ImageBitmap directly from blob (avoids CSP issues)
        const imageBitmap = await createImageBitmap(blob);
        
        // Clear canvas with transparent background
        ctx.clearRect(0, 0, 512, 512);
        
        // Calculate scaling to maintain aspect ratio
        const scale = Math.min(512 / imageBitmap.width, 512 / imageBitmap.height);
        const scaledWidth = imageBitmap.width * scale;
        const scaledHeight = imageBitmap.height * scale;
        const x = (512 - scaledWidth) / 2;
        const y = (512 - scaledHeight) / 2;
        
        // Draw the image
        ctx.drawImage(imageBitmap, x, y, scaledWidth, scaledHeight);
        
        // Clean up ImageBitmap
        imageBitmap.close();
        
        // Convert to WebP
        canvas.toBlob(
          (webpBlob) => {
            if (webpBlob) {
              resolve(webpBlob);
            } else {
              reject(new Error(`Failed to convert ${name} to WebP`));
            }
          },
          'image/webp',
          0.9
        );
      } catch (error) {
        reject(new Error(`Error processing ${name}: ${error}`));
      }
    });
  }

  static getFileExtension(url: string): string {
    try {
      const pathname = new URL(url).pathname;
      const extension = pathname.split('.').pop()?.toLowerCase();
      return extension || 'png';
    } catch {
      return 'png';
    }
  }

  static async downloadStickerPack(stickerPack: StickerPack): Promise<void> {
    // Instead of JSON, we'll download stickers as WebP files in a ZIP
    // Users can then manually add these to WhatsApp using the app
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    // Add pack info file
    const packInfo = `WhatsApp Sticker Pack: ${stickerPack.name}
Created: ${new Date().toLocaleDateString()}
Stickers: ${stickerPack.stickers.length}

How to add to WhatsApp:
1. Save all WebP files to your phone
2. Open WhatsApp
3. Go to any chat
4. Tap the sticker icon
5. Tap the + icon
6. Select the WebP files you want to add

Publisher: ${stickerPack.publisher}`;
    
    zip.file('README.txt', packInfo);
    
    let completed = 0;
    const total = stickerPack.stickers.length;
    
    // Download and convert each sticker to WebP
    const downloadPromises = stickerPack.stickers.map(async (sticker, index) => {
      try {
        const response = await fetch(sticker.imageFile, {
          mode: 'cors',
          credentials: 'omit'
        });
        if (!response.ok) throw new Error(`Failed to fetch sticker ${index + 1}: ${response.status}`);
        
        const blob = await response.blob();
        
        // Direct canvas conversion without blob URL
        const webpBlob = await this.convertBlobToWebPDirect(blob, `sticker_${index + 1}`);
        
        zip.file(`sticker_${String(index + 1).padStart(2, '0')}.webp`, webpBlob);
        
        completed++;
        window.dispatchEvent(new CustomEvent('whatsappPackProgress', {
          detail: { completed, total, current: `Sticker ${index + 1}` }
        }));
      } catch (error) {
        console.error(`Error processing sticker ${index + 1}:`, error);
        completed++; // Count as completed to not block progress
        
        // Add original file instead if conversion fails
        try {
          const response = await fetch(sticker.imageFile);
          if (response.ok) {
            const originalBlob = await response.blob();
            zip.file(`original_sticker_${String(index + 1).padStart(2, '0')}.${this.getFileExtension(sticker.imageFile)}`, originalBlob);
          }
        } catch (fallbackError) {
          zip.file(`error_sticker_${index + 1}.txt`, `Failed to process: ${error}\\nFallback error: ${fallbackError}`);
        }
      }
    });
    
    await Promise.all(downloadPromises);
    
    // Generate and download ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${stickerPack.name.replace(/[^a-zA-Z0-9]/g, '_')}_WhatsApp_Stickers.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async downloadSingleSticker(sticker: { name: string; imageUrl: string }): Promise<void> {
    try {
      // Convert to WebP format (512x512) as required by WhatsApp
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 512;
      canvas.height = 512;

      const img = new Image();
      img.crossOrigin = "anonymous";

      return new Promise((resolve, reject) => {
        img.onload = () => {
          if (ctx) {
            ctx.drawImage(img, 0, 0, 512, 512);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `${sticker.name.replace(
                    /\s+/g,
                    "_"
                  )}_sticker.webp`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  resolve();
                } else {
                  reject(new Error("Failed to create blob"));
                }
              },
              "image/webp",
              0.9
            );
          }
        };
        img.onerror = reject;
        img.src = sticker.imageUrl;
      });
    } catch (error) {
      console.error("Error downloading sticker:", error);
      // Fallback: direct download
      const link = document.createElement("a");
      link.href = sticker.imageUrl;
      link.download = `${sticker.name.replace(/\s+/g, "_")}_sticker.png`;
      link.click();
    }
  }
}
