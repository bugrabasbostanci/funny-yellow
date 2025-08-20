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
      "Funny Emoji": ["😂", "🤣", "😆", "😄"],
      Reactions: ["👍", "👎", "😮", "😱"],
      Memes: ["🔥", "💯", "😎", "🤪"],
      Expressions: ["😊", "😢", "😡", "😴"],
      Animals: ["🐶", "🐱", "🐭", "🐹"],
      Love: ["❤️", "💕", "😍", "🥰"],
      Party: ["🎉", "🎊", "🥳", "🎈"],
    };
    return emojiMap[category] || ["😊", "👍"];
  }

  static generateWhatsAppUrl(stickerPack: StickerPack): string {
    // WhatsApp sticker URL format
    const baseUrl = "https://wa.me/sticker/";
    const encodedPack = encodeURIComponent(JSON.stringify(stickerPack));
    return `${baseUrl}${encodedPack}`;
  }

  static async downloadStickerPack(stickerPack: StickerPack): Promise<void> {
    // Create a downloadable file for the sticker pack
    const packData = JSON.stringify(stickerPack, null, 2);
    const blob = new Blob([packData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${stickerPack.name.replace(
      /\s+/g,
      "_"
    )}_sticker_pack.json`;
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
