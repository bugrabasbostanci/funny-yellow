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
  name?: string;
}

export class WhatsAppStickerService {
  static async createStickerPack(
    stickers: { id: string; name: string; tags: string[]; imageUrl: string }[],
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
        emojis: this.getTagBasedEmojis(sticker.tags || ["default"]),
        name: sticker.name,
      })),
    };

    return stickerPack;
  }

  static getTagBasedEmojis(tags: string[]): string[] {
    const emojiMap: Record<string, string[]> = {
      // Emotion tags
      funny: ["😂", "🤣", "😆", "😄", "😁", "😊"],
      cute: ["🥰", "😍", "😊", "🤗", "😇", "🥺"],
      love: ["❤️", "💕", "💖", "😍", "🥰", "💘"],
      sad: ["😢", "😭", "😔", "☹️", "😞", "💔"],
      angry: ["😡", "😤", "🤬", "😠", "👿", "💢"],
      happy: ["😊", "😄", "😁", "🙂", "😃", "😀"],
      crazy: ["🤪", "😜", "🤯", "😵", "🤡", "🎭"],
      nervous: ["😰", "😅", "😓", "😬", "😟", "🫨"],
      
      // Action tags
      thumbs: ["👍", "👎", "👌", "🤙", "🤘", "✌️"],
      wink: ["😉", "😘", "😗", "😙", "💋", "😚"],
      thinking: ["🤔", "💭", "🧠", "🤷", "💡", "❓"],
      facepalm: ["🤦", "😤", "🙄", "😮‍💨", "😔", "😩"],
      sideeye: ["🙄", "😏", "🤨", "😒", "👀", "👁️"],
      
      // Character tags
      kermit: ["🐸", "🎭", "🌟", "💚", "🎪", "🎨"],
      shrek: ["👹", "💚", "🌿", "🏰", "✨", "🎭"],
      monkey: ["🐵", "🙈", "🙉", "🙊", "🍌", "🌴"],
      cat: ["🐱", "😸", "😹", "😻", "😼", "😽"],
      agent: ["🕵️", "🔍", "🕴️", "🔎", "🔐", "⚡"],
      
      // Object tags
      flower: ["🌸", "🌺", "🌻", "🌷", "🌹", "💐"],
      rose: ["🌹", "💐", "❤️", "💕", "🌺", "💖"],
      
      // Mood tags
      villain: ["😈", "👿", "🔥", "⚡", "💀", "🖤"],
      spy: ["🕵️", "🔍", "🕴️", "🔎", "🔐", "⚡"],
      rizz: ["😎", "💪", "🔥", "✨", "👑", "💯"],
      
      // General tags
      emoji: ["😊", "😄", "😁", "🙂", "😃", "😀"],
      reaction: ["👍", "👎", "😮", "😱", "👏", "🙌"],
      meme: ["😂", "🤣", "💀", "😭", "🔥", "💯"],
      rude: ["🖕", "😠", "💢", "😤", "👿", "🤬"],
      
      // Default fallback
      default: ["😊", "👍", "😄", "🎉", "✨", "💫"]
    };
    
    // Collect emojis from all matching tags
    const collectedEmojis = new Set<string>();
    
    for (const tag of tags) {
      const tagEmojis = emojiMap[tag.toLowerCase()];
      if (tagEmojis) {
        tagEmojis.forEach(emoji => collectedEmojis.add(emoji));
      }
    }
    
    // If no emojis found, use default
    if (collectedEmojis.size === 0) {
      return emojiMap.default;
    }
    
    // Return up to 6 emojis (WhatsApp limit)
    return Array.from(collectedEmojis).slice(0, 6);
  }

  // Keep legacy method for backward compatibility
  static getCategoryEmojis(category: string): string[] {
    return this.getTagBasedEmojis([category]);
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

  static async downloadStickerPack(stickerPack: StickerPack): Promise<void> {
    // Download stickers individually as WebP files for WhatsApp
    let completed = 0;
    const total = stickerPack.stickers.length;
    
    // Process each sticker sequentially to avoid overwhelming the browser
    for (let index = 0; index < stickerPack.stickers.length; index++) {
      const sticker = stickerPack.stickers[index];
      
      try {
        const response = await fetch(sticker.imageFile, {
          mode: 'cors',
          credentials: 'omit'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch sticker ${index + 1}`);
        }

        const blob = await response.blob();
        const webpBlob = await this.convertBlobToWebPDirect(blob, sticker.name || `sticker_${index + 1}`);
        
        // Download individual WebP file with sticker name
        const fileName = sticker.name 
          ? `${this.sanitizeFileName(sticker.name)}.webp`
          : `whatsapp_sticker_${(index + 1).toString().padStart(3, '0')}.webp`;
        
        const url = URL.createObjectURL(webpBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        completed++;
        
        // Dispatch progress event
        const progressEvent = new CustomEvent('whatsappPackProgress', {
          detail: { completed, total, current: `sticker_${index + 1}.webp` }
        });
        window.dispatchEvent(progressEvent);
        
        // Small delay between downloads to avoid browser throttling
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`Error processing sticker ${index + 1}:`, error);
        // Continue with other stickers even if one fails
      }
    }
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
            // Calculate scaling to maintain aspect ratio
            const scale = Math.min(512 / img.width, 512 / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const x = (512 - scaledWidth) / 2;
            const y = (512 - scaledHeight) / 2;
            
            // Clear canvas with transparent background
            ctx.clearRect(0, 0, 512, 512);
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
            
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
