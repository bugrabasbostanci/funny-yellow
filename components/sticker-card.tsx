"use client";

import type React from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, Download, Eye, MessageCircle } from "lucide-react";
import { useState } from "react";
import { WhatsAppStickerService } from "@/lib/whatsapp-integration";
import { useAuth } from "@/lib/auth-context";

interface StickerCardProps {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  downloadCount: number;
  isLiked?: boolean;
  onLike?: (id: string) => void;
  onDownload?: (id: string) => void;
  onPreview?: (id: string) => void;
}

export function StickerCard({
  id,
  name,
  category,
  imageUrl,
  downloadCount,
  isLiked = false,
  onLike,
  onDownload,
  onPreview,
}: StickerCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { user, addToDownloadHistory } = useAuth();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(id);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPreview(true);
    onPreview?.(id);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);

    try {
      // Regular download as PNG
      const link = document.createElement("a");
      link.href = imageUrl || "/placeholder.svg";
      link.download = `${name.replace(/\s+/g, "_")}_sticker.png`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (user) {
        addToDownloadHistory(id);
      }

      onDownload?.(id);
    } catch (error) {
      console.error("Error downloading sticker:", error);
    }

    setIsDownloading(false);
  };

  const handleWhatsAppDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);

    try {
      await WhatsAppStickerService.downloadSingleSticker({
        name,
        imageUrl,
      });

      if (user) {
        addToDownloadHistory(id);
      }

      onDownload?.(id);
    } catch (error) {
      console.error("Error downloading sticker:", error);
    }

    setIsDownloading(false);
  };

  return (
    <>
      <Card
        className="group relative overflow-hidden bg-card hover:shadow-lg transition-all duration-300 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handlePreview}
      >
        {/* Sticker Image */}
        <div className="aspect-square relative bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={name}
            fill
            className={`object-contain transition-transform duration-300 ${
              isHovered ? "scale-110" : "scale-100"
            }`}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />

          {/* Hover Overlay */}
          <div
            className={`absolute inset-0 bg-black/20 flex items-center justify-center gap-2 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white shadow-sm"
              onClick={handlePreview}
              title="Preview sticker"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className={`bg-white/90 hover:bg-white shadow-sm transition-colors ${
                isLiked
                  ? "text-red-500 hover:text-red-600"
                  : "hover:text-red-500"
              }`}
              onClick={handleLike}
              title={isLiked ? "Unlike" : "Like"}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </Button>
            <Button
              size="sm"
              className="bg-success hover:bg-success/90 text-success-foreground shadow-sm"
              onClick={handleWhatsAppDownload}
              disabled={isDownloading}
              title="Download for WhatsApp (WebP)"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 shadow-sm"
              onClick={handleDownload}
              disabled={isDownloading}
              title="Download sticker (PNG)"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sticker Info */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-sm truncate">{name}</h3>
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{downloadCount.toLocaleString()} downloads</span>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3 text-success" />
              <span>WhatsApp</span>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-8 relative">
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={name}
                fill
                className="object-contain"
                sizes="400px"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Category: {category}</span>
              <span>{downloadCount.toLocaleString()} downloads</span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleWhatsAppDownload}
                disabled={isDownloading}
                className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                variant="outline"
                className="flex-1 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
