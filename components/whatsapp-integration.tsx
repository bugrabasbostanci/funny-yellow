"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { WhatsAppStickerService } from "@/lib/whatsapp-integration";
import { useState } from "react";

interface WhatsAppIntegrationProps {
  stickers: { id: string; name: string; category: string; imageUrl: string }[];
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppIntegration({ stickers, isOpen, onClose }: WhatsAppIntegrationProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCreatePack = async () => {
    if (stickers.length === 0) return;
    
    setIsDownloading(true);
    try {
      const stickerPack = await WhatsAppStickerService.createStickerPack(
        stickers,
        `Custom Pack ${new Date().toLocaleDateString()}`
      );
      await WhatsAppStickerService.downloadStickerPack(stickerPack);
      onClose();
    } catch (error) {
      console.error("Error creating WhatsApp pack:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Create WhatsApp Pack</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create a WhatsApp sticker pack with {stickers.length} selected stickers.
          </p>
          
          <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
            {stickers.slice(0, 8).map((sticker) => (
              <div key={sticker.id} className="aspect-square bg-background rounded border">
                <img 
                  src={sticker.imageUrl} 
                  alt={sticker.name}
                  className="w-full h-full object-contain p-1"
                />
              </div>
            ))}
            {stickers.length > 8 && (
              <div className="aspect-square bg-muted rounded border flex items-center justify-center text-xs">
                +{stickers.length - 8}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCreatePack}
              disabled={isDownloading || stickers.length === 0}
              className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {isDownloading ? "Creating..." : "Create Pack"}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}