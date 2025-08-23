"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Package } from "lucide-react";
import { type StickerPack } from "@/lib/pack-definitions";
import { DownloadOptionsModal } from "./download-options-modal";
import { type StickerForDownload } from "@/lib/bulk-download-utils";
import Image from "next/image";

// Helper component for preview images with fallback
function PreviewImage({ imageUrl, character, alt }: { imageUrl?: string; character: string; alt: string }) {
  const [imageError, setImageError] = useState(false);
  
  const getCharacterEmoji = (char: string) => {
    switch (char.toLowerCase()) {
      case "emoji": return "😀";
      case "kermit": return "🐸";
      case "pocoyo": return "👦";
      case "shrek": return "👹";
      case "animals": return "🐱";
      case "cat": return "🐱";
      default: return "📦";
    }
  };

  if (imageError || !imageUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center text-2xl">
        {getCharacterEmoji(character)}
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={80}
      height={80}
      className="w-full h-full object-contain"
      onError={() => {
        console.log(`❌ Failed to load image: ${imageUrl}`);
        setImageError(true);
      }}
    />
  );
}

interface PackCardProps {
  pack: StickerPack;
  stickers: StickerForDownload[];
  onDownload: (stickerId: string) => Promise<void>;
  onBulkDownloadComplete: (stickerIds: string[]) => Promise<void>;
}

export function PackCard({ 
  pack, 
  stickers, 
  onDownload, 
  onBulkDownloadComplete 
}: PackCardProps) {
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const handleDownloadPack = () => {
    setShowDownloadModal(true);
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          {/* Pack Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-lg font-display text-foreground group-hover:text-primary transition-colors">
                {pack.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                {pack.description}
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0">
              <Package className="w-3 h-3 mr-1" />
              {pack.totalStickers}
            </Badge>
          </div>

          {/* Preview Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {stickers.slice(0, 3).map((sticker, index) => (
              <div
                key={`${sticker.id}-${index}`}
                className="aspect-square bg-muted/50 rounded-lg overflow-hidden flex items-center justify-center"
              >
                <PreviewImage
                  imageUrl={sticker.imageUrl}
                  character={pack.character}
                  alt={`${pack.character} sticker`}
                />
              </div>
            ))}
          </div>

          {/* Character Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {pack.character}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              {pack.totalStickers} sticker{pack.totalStickers !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownloadPack}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Pack
          </Button>
        </CardContent>
      </Card>

      {/* Download Modal */}
      <DownloadOptionsModal
        stickers={stickers}
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onDownload={onDownload}
        onBulkDownloadComplete={onBulkDownloadComplete}
      />
    </>
  );
}