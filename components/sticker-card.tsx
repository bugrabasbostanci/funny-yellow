"use client";

import type React from "react";
import { OptimizedImage } from "./optimized-image";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, Download, Eye, MessageCircle, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { DownloadService } from "@/lib/download-service";
import { useAuth } from "@/lib/auth-context";
import { PlatformDetection, type PlatformInfo } from "@/lib/platform-detection";

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
  const [showFormatOptions, setShowFormatOptions] = useState(false);
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo | null>(null);
  const { user, addToDownloadHistory } = useAuth();

  useEffect(() => {
    setPlatformInfo(PlatformDetection.getPlatformInfo());
  }, []);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(id);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPreview(true);
    onPreview?.(id);
  };

  const handleSmartDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const format = platformInfo?.recommendedFormat || 'png';
    await downloadSticker(format);
  };

  const handleFormatDownload = async (e: React.MouseEvent, format: 'png' | 'webp') => {
    e.stopPropagation();
    await downloadSticker(format);
  };

  const downloadSticker = async (format: 'png' | 'webp') => {
    setIsDownloading(true);

    try {
      await DownloadService.downloadSticker(
        { id, name, imageUrl: imageUrl || "/placeholder.svg" },
        format
      );

      if (user) {
        addToDownloadHistory(id);
      }

      onDownload?.(id);
    } catch (error) {
      console.error("Error downloading sticker:", error);
    }

    setIsDownloading(false);
  };

  const toggleFormatOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFormatOptions(!showFormatOptions);
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
        <div className="aspect-square relative bg-white/80 backdrop-blur-sm border border-yellow-200/20 shadow-sm p-4">
          <div className="relative w-full h-full">
            <OptimizedImage
              src={imageUrl || "/placeholder.svg"}
              alt={`${name} sticker - ${category}`}
              fill
              className={`object-contain transition-transform duration-300 ${
                isHovered ? "scale-110" : "scale-100"
              }`}
              sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
              priority={false}
              quality={80} // Slightly lower quality for grid view
              onError={() => {
                console.warn(`Failed to load sticker image: ${name}`);
              }}
            />
          </div>

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
            {showFormatOptions ? (
              <>
                <Button
                  size="sm"
                  className="bg-success hover:bg-success/90 text-success-foreground shadow-sm"
                  onClick={(e) => handleFormatDownload(e, 'webp')}
                  disabled={isDownloading}
                  title="Download as WebP (smaller file)"
                >
                  WebP
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  onClick={(e) => handleFormatDownload(e, 'png')}
                  disabled={isDownloading}
                  title="Download as PNG (better compatibility)"
                >
                  PNG
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white shadow-sm"
                  onClick={toggleFormatOptions}
                  title="Close format options"
                >
                  ✕
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 shadow-sm"
                  onClick={handleSmartDownload}
                  disabled={isDownloading}
                  title={platformInfo ? `Download (${platformInfo.recommendedFormat.toUpperCase()}) - ${PlatformDetection.getFormatRecommendation().reason}` : "Download sticker"}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white shadow-sm"
                  onClick={toggleFormatOptions}
                  title="Choose format"
                >
                  <Info className="w-4 h-4" />
                </Button>
              </>
            )}
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
              <span>{platformInfo?.isWhatsAppWeb ? 'WhatsApp Web' : 'WhatsApp'}</span>
            </div>
          </div>
          {platformInfo && (
            <div className="text-xs text-muted-foreground mt-1 truncate">
              Optimized for {PlatformDetection.getPlatformDescription()}
            </div>
          )}
        </div>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-square bg-white/80 backdrop-blur-sm border border-yellow-200/20 shadow-sm rounded-lg p-8 relative">
              <div className="relative w-full h-full">
                <OptimizedImage
                  src={imageUrl || "/placeholder.svg"}
                  alt={`${name} sticker preview - ${category}`}
                  fill
                  className="object-contain"
                  sizes="400px"
                  priority={true} // Priority for modal images
                  quality={95} // Higher quality for preview
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Category: {category}</span>
              <span>{downloadCount.toLocaleString()} downloads</span>
            </div>
            <div className="space-y-3">
              {platformInfo && (
                <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                  <strong>{PlatformDetection.getPlatformDescription()}</strong>
                  <br />
                  {PlatformDetection.getDownloadInstructions()}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={handleSmartDownload}
                  disabled={isDownloading}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {platformInfo?.recommendedFormat.toUpperCase() || 'Download'}
                </Button>
                <Button
                  onClick={(e) => handleFormatDownload(e, platformInfo?.recommendedFormat === 'png' ? 'webp' : 'png')}
                  disabled={isDownloading}
                  variant="outline"
                  className="flex-1"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {platformInfo?.recommendedFormat === 'png' ? 'WebP' : 'PNG'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
