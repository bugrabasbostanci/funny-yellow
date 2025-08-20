"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { WhatsAppStickerService, type StickerPack } from "@/lib/whatsapp-integration";
import { MessageCircle, Download, Package, ExternalLink } from "lucide-react";

interface Sticker {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  downloadCount: number;
  isLiked: boolean;
}

interface WhatsAppIntegrationProps {
  stickers: Sticker[];
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppIntegration({
  stickers,
  isOpen,
  onClose,
}: WhatsAppIntegrationProps) {
  const [packName, setPackName] = useState("My Funny Stickers");
  const [isCreating, setIsCreating] = useState(false);
  const [createdPack, setCreatedPack] = useState<StickerPack | null>(null);

  const handleCreatePack = async () => {
    setIsCreating(true);
    try {
      const stickerPack = await WhatsAppStickerService.createStickerPack(
        stickers,
        packName
      );
      setCreatedPack(stickerPack);
    } catch (error) {
      console.error("Error creating sticker pack:", error);
    }
    setIsCreating(false);
  };

  const handleAddToWhatsApp = () => {
    if (createdPack) {
      const whatsappUrl =
        WhatsAppStickerService.generateWhatsAppUrl(createdPack);
      window.open(whatsappUrl, "_blank");
    }
  };

  const handleDownloadPack = () => {
    if (createdPack) {
      WhatsAppStickerService.downloadStickerPack(createdPack);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <MessageCircle className="h-5 w-5 text-green-600" />
            WhatsApp Sticker Pack
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!createdPack ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="packName">Pack Name</Label>
                <Input
                  id="packName"
                  value={packName}
                  onChange={(e) => setPackName(e.target.value)}
                  placeholder="Enter sticker pack name"
                />
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Selected Stickers</span>
                  <Badge variant="secondary">
                    {Math.min(stickers.length, 30)} / 30
                  </Badge>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {stickers.slice(0, 30).map((sticker, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-white rounded border p-1 relative"
                    >
                      <Image
                        src={sticker.imageUrl || "/placeholder.svg"}
                        alt={sticker.name}
                        fill
                        className="object-contain"
                        sizes="60px"
                      />
                    </div>
                  ))}
                </div>
                {stickers.length > 30 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Only first 30 stickers will be included (WhatsApp limit)
                  </p>
                )}
              </div>

              <Button
                onClick={handleCreatePack}
                disabled={isCreating || !packName.trim()}
                className="w-full bg-success text-success-foreground hover:bg-success/90"
              >
                {isCreating ? (
                  <>
                    <Package className="mr-2 h-4 w-4 animate-spin" />
                    Creating Pack...
                  </>
                ) : (
                  <>
                    <Package className="mr-2 h-4 w-4" />
                    Create Sticker Pack
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">{createdPack.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Pack created with {createdPack.stickers.length} stickers
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleAddToWhatsApp}
                  className="w-full bg-success text-success-foreground hover:bg-success/90"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Add to WhatsApp
                </Button>

                <Button
                  onClick={handleDownloadPack}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Pack File
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                <p>Pack will be added to your WhatsApp stickers.</p>
                <p>Make sure you have WhatsApp installed on your device.</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
