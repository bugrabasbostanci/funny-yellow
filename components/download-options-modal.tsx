"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MessageCircle, Download, Package } from "lucide-react";
import { WhatsAppStickerService } from "@/lib/whatsapp-integration";
import { BulkDownloadService, type StickerForDownload } from "@/lib/bulk-download-utils";
import { SimplePlatformDetection } from "@/lib/simple-platform-detection";
import { DatabaseService } from "@/lib/database-service";
import { useState } from "react";

interface DownloadOptionsModalProps {
  stickers: StickerForDownload[];
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (stickerId: string) => void;
  onBulkDownloadComplete?: (stickerIds: string[]) => void;
}

type DownloadType = 'individual' | 'zip' | 'whatsapp';

export function DownloadOptionsModal({ 
  stickers, 
  isOpen, 
  onClose, 
  onDownload, 
  onBulkDownloadComplete 
}: DownloadOptionsModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadType, setDownloadType] = useState<DownloadType | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Platform detection for smart defaults
  const recommendedFormat = SimplePlatformDetection.getRecommendedFormat();

  const handleDownload = async (type: DownloadType) => {
    if (stickers.length === 0) return;
    
    setIsDownloading(true);
    setDownloadType(type);
    
    try {
      switch (type) {
        case 'individual':
          await BulkDownloadService.downloadIndividualStickers(stickers);
          break;
        case 'zip':
          await BulkDownloadService.downloadAsZip(
            stickers,
            `Sticker Pack - ${new Date().toLocaleDateString()}`
          );
          break;
        case 'whatsapp':
          const stickerPack = await WhatsAppStickerService.createStickerPack(
            stickers,
            `Custom Pack ${new Date().toLocaleDateString()}`
          );
          await WhatsAppStickerService.downloadStickerPack(stickerPack);
          break;
      }
      
      // Track downloads for all stickers efficiently in one batch
      try {
        console.log(`🔄 Tracking bulk download for ${stickers.length} stickers`);
        
        await DatabaseService.trackBulkDownload(
          stickers.map(s => s.id),
          "0.0.0.0", // IP address - could be improved with actual client IP
          navigator.userAgent
        );
        
        // Notify parent component that bulk download completed
        onBulkDownloadComplete?.(stickers.map(s => s.id));
        
        console.log(`✅ Bulk download tracking completed for ${stickers.length} stickers`);
      } catch (trackingError) {
        console.error("❌ Error tracking bulk download:", trackingError);
        // Fallback to individual tracking if bulk fails
        console.log("🔄 Falling back to individual download tracking...");
        if (onDownload) {
          stickers.forEach(sticker => {
            onDownload(sticker.id);
          });
        }
      }
      
      setTimeout(() => {
        onClose();
        setIsDownloading(false);
        setDownloadType(null);
      }, 1000);
    } catch (error) {
      console.error(`Error downloading ${type}:`, error);
      setIsDownloading(false);
      setDownloadType(null);
    }
  };

  const isWhatsAppDisabled = false; // No limit for individual WebP downloads

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Download Options</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose how to download your {stickers.length} selected stickers:
          </p>
          
          {/* Sticker Preview */}
          <div className="grid grid-cols-4 gap-2">
            {stickers.slice(0, 8).map((sticker) => (
              <div key={sticker.id} className="relative aspect-square bg-background rounded border">
                <Image 
                  src={sticker.imageUrl} 
                  alt={sticker.name}
                  fill
                  className="object-contain p-1"
                  sizes="(max-width: 768px) 25vw, 12.5vw"
                />
              </div>
            ))}
            {stickers.length > 8 && (
              <div className="aspect-square bg-muted rounded border flex items-center justify-center text-xs">
                +{stickers.length - 8}
              </div>
            )}
          </div>

          {/* Download Options */}
          <div className="space-y-2">
            {/* WhatsApp Pack - Primary option */}
            <Button
              variant="outline"
              className="w-full justify-between p-4 h-auto border-2 border-green-200 hover:border-green-400"
              onClick={() => handleDownload('whatsapp')}
              disabled={isDownloading || isWhatsAppDisabled}
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <div className="font-semibold text-green-700">WhatsApp Mobile</div>
                  <div className="text-xs text-muted-foreground">
                    WebP format for mobile WhatsApp
                  </div>
                </div>
              </div>
              {isDownloading && downloadType === 'whatsapp' && (
                <div className="text-xs text-green-600">Downloading...</div>
              )}
            </Button>

            {/* Quick Download - Platform optimized */}
            <Button
              variant="outline"
              className="w-full justify-between p-4 h-auto border-2 border-blue-200 hover:border-blue-400"
              onClick={() => handleDownload('individual')}
              disabled={isDownloading}
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-blue-700">Universal Format</div>
                  <div className="text-xs text-muted-foreground">
                    {recommendedFormat.toUpperCase()} - works everywhere
                  </div>
                </div>
              </div>
              {isDownloading && downloadType === 'individual' && (
                <div className="text-xs text-blue-600">Downloading...</div>
              )}
            </Button>

            {/* Advanced Options Toggle */}
            <div className="text-center py-1">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                disabled={isDownloading}
              >
                {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
              </button>
            </div>

            {/* ZIP Download - Advanced option */}
            {showAdvanced && (
              <Button
                variant="outline"
                className="w-full justify-between p-4 h-auto border border-gray-200"
                onClick={() => handleDownload('zip')}
                disabled={isDownloading}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium">ZIP Archive</div>
                    <div className="text-xs text-muted-foreground">
                      All stickers in one file
                    </div>
                  </div>
                </div>
                {isDownloading && downloadType === 'zip' && (
                  <div className="text-xs text-gray-600">Downloading...</div>
                )}
              </Button>
            )}
          </div>

          {/* Cancel Button */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full mt-4"
            disabled={isDownloading}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}